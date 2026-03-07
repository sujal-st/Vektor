from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import db
from bson import ObjectId
from jose import jwt, JWTError
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os

load_dotenv()

router = APIRouter()
security = HTTPBearer(auto_error=False)
JWT_SECRET = os.getenv("JWT_SECRET")

class ReviewSchema(BaseModel):
    product_id: str
    text: str
    rating: int  # 1-5

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        if not credentials:
            return None
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")


# check if user has purchased the product
async def has_purchased(user_id: str, product_id: str) -> bool:
    order = await db.orders.find_one({
        "user_id": user_id,
        "items.id": product_id  # check if product exists in any order
    })
    return order is not None


# post a review
@router.post("/reviews")
async def post_review(review: ReviewSchema, user=Depends(get_current_user)):
    try:
        print("user:", user)
        print("review:", review)

        if not user:
            raise HTTPException(status_code=401, detail="Login required to post a review")

        user_id = user["id"]
        user_name = user["userName"]
        print("user id:", user_id)
        print("user name:", user_name)


        # validate rating
        if review.rating < 1 or review.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

        # check if product exists
        product = await db.products.find_one({"_id": ObjectId(review.product_id)})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # check if user already reviewed this product
        existing_review = await db.reviews.find_one({
            "user_id": user_id,
            "product_id": review.product_id
        })
        if existing_review:
            raise HTTPException(status_code=400, detail="You have already reviewed this product")

        # check purchase verification
        purchased = await has_purchased(user_id, review.product_id)

        if not purchased:  # ← add this to block
            raise HTTPException(status_code=403, detail="You can only review products you have purchased")

        new_review = {
            "user_id": user_id,
            "user_name": user_name,
            "product_id": review.product_id,
            "text": review.text,
            "rating": review.rating,
            "purchased_verification": purchased,  # True if user bought the product
            "created_at": datetime.utcnow()
        }

        result = await db.reviews.insert_one(new_review)
        new_review["id"] = str(result.inserted_id)
        del new_review["_id"]

        return {"message": "Review posted successfully", "review": new_review}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# get all reviews for a product
@router.get("/reviews/{product_id}")
async def get_reviews(product_id: str):
    try:
        reviews = await db.reviews.find(
            {"product_id": product_id}
        ).sort("created_at", -1).to_list(100)  # newest first

        for r in reviews:
            r["id"] = str(r["_id"])
            del r["_id"]

        return reviews

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# delete a review (only by the user who posted it)
@router.delete("/reviews/{review_id}")
async def delete_review(review_id: str, user=Depends(get_current_user)):
    try:
        if not user:
            raise HTTPException(status_code=401, detail="Login required")

        review = await db.reviews.find_one({"_id": ObjectId(review_id)})

        if not review:
            raise HTTPException(status_code=404, detail="Review not found")

        # only allow the owner or admin to delete
        if review["user_id"] != user["id"] and not user.get("is_admin"):
            raise HTTPException(status_code=403, detail="Not authorized to delete this review")

        await db.reviews.delete_one({"_id": ObjectId(review_id)})
        return {"message": "Review deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))