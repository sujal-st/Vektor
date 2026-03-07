from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import db
from bson import ObjectId
from jose import jwt, JWTError
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum
import os

load_dotenv()

router = APIRouter()
security = HTTPBearer(auto_error=False)
JWT_SECRET = os.getenv("JWT_SECRET")


class OrderStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class OrderItem(BaseModel):
    id: str
    title: str
    price: float
    img: str
    category: str
    quantity: int
    admin_id: Optional[str] = None


class ShippingInfo(BaseModel):
    full_name: str
    address: str
    city: str
    phone: str


class OrderSchema(BaseModel):
    items: List[OrderItem]
    shipping_info: ShippingInfo
    payment_method: str


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        if not credentials:
            return None
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")


def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        if not credentials:
            raise HTTPException(status_code=401, detail="Not logged in")
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        if not payload.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admins only")
        return payload
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")


@router.post("/orders")
async def save_order(order: OrderSchema, user=Depends(get_current_user)):
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Login required to place an order")

        if not order.items:
            raise HTTPException(status_code=400, detail="Order must have at least one item")

        total_price = sum(item.price * item.quantity for item in order.items)

        for item in order.items:
            product = await db.products.find_one({"_id": ObjectId(item.id)})
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.title} not found")
            if product["stock"] < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for {item.title}. Available: {product['stock']}"
                )

        for item in order.items:
            await db.products.update_one(
                {"_id": ObjectId(item.id)},
                {"$inc": {"stock": -item.quantity}}
            )

        new_order = {
            "user_id": user["id"],
            "items": [
                {
                    **item.dict(),
                    "item_status": "pending"
                }
                for item in order.items
            ],
            "shipping_info": order.shipping_info.dict(),
            "payment_method": order.payment_method,
            "total_price": total_price,
            "order_status": OrderStatus.pending,
            "created_at": datetime.utcnow()
        }

        result = await db.orders.insert_one(new_order)
        new_order["id"] = str(result.inserted_id)
        del new_order["_id"]

        await db.carts.delete_one({"user_id": user["id"]})

        return {"message": "Order placed successfully", "order": new_order}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── GET routes — order matters: specific paths before /{order_id} ────────────

@router.get("/orders/my-orders")
async def get_my_orders(user=Depends(get_current_user)):
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Login required")

        orders = await db.orders.find(
            {"user_id": user["id"]}
        ).sort("created_at", -1).to_list(100)

        for order in orders:
            order["id"] = str(order["_id"])
            del order["_id"]

        return orders

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orders/seller/my-orders")
async def get_seller_orders(user=Depends(get_current_admin)):
    try:
        orders = await db.orders.find(
            {"items.admin_id": user["id"]}
        ).sort("created_at", -1).to_list(100)

        for order in orders:
            order["id"] = str(order["_id"])
            del order["_id"]
            order["items"] = [
                item for item in order["items"]
                if item["admin_id"] == user["id"]
            ]

        return orders

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orders/seller/{order_id}")
async def get_seller_order(order_id: str, user=Depends(get_current_admin)):
    try:
        order = await db.orders.find_one({
            "_id": ObjectId(order_id),
            "items.admin_id": user["id"]
        })

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        order["id"] = str(order["_id"])
        del order["_id"]

        return order

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orders/{order_id}")  # ← must be LAST among GET routes
async def get_order(order_id: str, user=Depends(get_current_user)):
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Login required")

        order = await db.orders.find_one({
            "_id": ObjectId(order_id),
            "user_id": user["id"]
        })

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        order["id"] = str(order["_id"])
        del order["_id"]

        return order

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── PUT routes ───────────────────────────────────────────────────────────────

@router.put("/orders/{order_id}/item/{item_id}")
async def update_item_status(
    order_id: str,
    item_id: str,
    status: OrderStatus,
    user=Depends(get_current_admin)
):
    try:
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        item = next(
            (i for i in order["items"] if i["id"] == item_id and i["admin_id"] == user["id"]),
            None
        )
        if not item:
            raise HTTPException(status_code=403, detail="Not authorized to update this item")

        # update the specific item's status
        await db.orders.update_one(
            {"_id": ObjectId(order_id), "items.id": item_id},
            {"$set": {"items.$.item_status": status, "updated_at": datetime.utcnow()}}
        )

        # fetch updated order to check overall status
        updated_order = await db.orders.find_one({"_id": ObjectId(order_id)})
        all_items = updated_order["items"]

        all_delivered = all(i["item_status"] == "delivered" for i in all_items)
        all_cancelled = all(i["item_status"] == "cancelled" for i in all_items)
        any_shipped = any(i["item_status"] == "shipped" for i in all_items)
        any_confirmed = any(i["item_status"] == "confirmed" for i in all_items)

        # auto update overall order status based on item statuses
        if all_delivered:
            new_order_status = "delivered"
        elif all_cancelled:
            new_order_status = "cancelled"
        elif any_shipped:
            new_order_status = "shipped"
        elif any_confirmed:
            new_order_status = "confirmed"
        else:
            new_order_status = "pending"

        await db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"order_status": new_order_status, "updated_at": datetime.utcnow()}}
        )

        return {"message": "Item status updated successfully", "order_status": new_order_status}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: OrderStatus,
    user=Depends(get_current_admin)
):
    try:
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        await db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"order_status": status, "updated_at": datetime.utcnow()}}
        )

        return {"message": "Order status updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))