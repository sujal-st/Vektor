from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import db
from jose import jwt, JWTError
from dotenv import load_dotenv
import os
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional



load_dotenv()

router = APIRouter()
security = HTTPBearer(auto_error=False)
JWT_SECRET = os.getenv("JWT_SECRET")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class CartItem(BaseModel):
    id: str
    title: str
    price: float
    img: str
    category: str
    description: str
    stock: int
    featured: bool
    quantity: int
    admin_id: Optional[str] = None

class CartSchema(BaseModel):
    items: List[CartItem]

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        if not credentials:
            return None
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload["id"]
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")

@router.post("/cart")
async def save_cart(cart: CartSchema, user_id: str =Depends(get_current_user)):
    try:
        if not user_id:
            return {"message": "Not logged in, cart not saved"}

        existing_cart = await db.carts.find_one({"user_id": user_id})

        if existing_cart:
            await db.carts.update_one(
                {"user_id":user_id},
                {
                    "$set":{
                        "items":[item.dict() for item in cart.items],
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        else:
            await db.carts.insert_one({
                "user_id":user_id,
                "items":[item.dict() for item in cart.items],
                "created_at": datetime.utcnow(),
                "updated_at":datetime.utcnow()
            })
        return {"message":"Cart saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cart")
async def get_carts(user_id:str=Depends(get_current_user)):
    try:

        if not user_id:
            return {"items": []}
        cart= await db.carts.find_one({"user_id":user_id})

        if not cart:
            return {"user_id": user_id, "items":[]}

        cart["id"]=str(cart["_id"])
        del cart["_id"]

        return cart

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/cart/{item_id}")
async def remove_from_cart(item_id: str, user_id: str = Depends(get_current_user)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Not logged in")
    
    cart= await db.carts.find_one({"user_id":user_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    updated_items = [item for item in cart["items"] if item["_id"]!=item_id]

    if len(updated_items)== len(cart["items"]):
        raise HTTPException(status_code=404, detail="Item not found in cart")

    await db.carts.update_one(
        {"user_id": user_id},
        {"$set":{"items": updated_items,"updated_at": datetime.utcnow()}}
    )

    return {"message":"Item removed successfully"}