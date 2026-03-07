from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import db
from bson import ObjectId
from jose import jwt, JWTError
from dotenv import load_dotenv
import os
import shutil
from datetime import datetime
import cloudinary
import cloudinary.uploader


load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

router = APIRouter()
security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_image(img) -> str:
    if os.getenv("CLOUDINARY_CLOUD_NAME"):
        # production — upload to Cloudinary
        result = cloudinary.uploader.upload(img.file)
        return result["secure_url"]
    else:
        # local — save to uploads folder
        filename = f"{int(datetime.now().timestamp())}-{img.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(img.file, buffer)
        return f"/uploads/{filename}"


# helper to format product
def format_product(product):
    product["id"] = str(product["_id"])
    del product["_id"]
    return product


# helper to verify admin token
def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

        if not payload.get("is_admin"):
            raise HTTPException(status_code=403, detail="Admins only")

        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# get all products (public - no auth needed)
@router.get("/products")
async def get_products():
    try:
        products = await db.products.find().to_list(100)
        return [format_product(p) for p in products]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# get products by admin (admin only)
@router.get("/products/my-products")
async def get_my_products(admin=Depends(get_current_admin)):
    try:
        products = await db.products.find({"admin_id": admin["id"]}).to_list(100)
        return [format_product(p) for p in products]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# get similar products by category
@router.get("/products/{id}/similar")
async def get_similar_products(id: str):
    try:
        product = await db.products.find_one({"_id": ObjectId(id)})
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        similar = await db.products.find({
            "category": product["category"],
            "_id":{"$ne": ObjectId(id)}
        }).to_list(4)

        return [format_product(p) for p in similar]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# get product by id
@router.get("/products/{id}")
async def get_product_by_id(id: str):
    try:
        product = await db.products.find_one({"_id": ObjectId(id)})
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        return format_product(product) 
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# create product (admin only)
@router.post("/products")
async def create_product(
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    img: UploadFile = File(...),
    featured: bool = Form(False),
    stock: int = Form(...),
    admin=Depends(get_current_admin)
):
    try:
        img_url = save_image(img)

        product = {
            "title": title,
            "description": description,
            "price": price,
            "category": category,
            "stock": stock,
            "featured": featured,
            "img": img_url,
            "admin_id": admin["id"]
        }

        result = await db.products.insert_one(product)
        product["id"] = str(result.inserted_id)
        product.pop("_id", None)
        return {
            "message": "Product added",
            "product": {**product, "id": str(result.inserted_id)}
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# delete product (admin only - can only delete their own products)
@router.delete("/products/{id}")
async def delete_product(id: str, admin=Depends(get_current_admin)):
    try:
        product = await db.products.find_one({"_id": ObjectId(id)})

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if product["admin_id"] != admin["id"]:
            raise HTTPException(status_code=403, detail="You can only delete your own products")

        deleted = await db.products.find_one_and_delete({"_id": ObjectId(id)})

        return {
            "message": "Product deleted successfully",
            "deletedProduct": format_product(deleted)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/products/{id}")
async def update_product(
    id: str,
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    featured: bool = Form(False),
    stock: int = Form(...),
    img: UploadFile = File(None),
    admin=Depends(get_current_admin)
):
    try:
        product = await db.products.find_one({"_id": ObjectId(id)})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if product["admin_id"] != admin["id"]:
            raise HTTPException(status_code=403, detail="You can only edit your own products")

        updated_fields = {
            "title": title,
            "description": description,
            "price": price,
            "category": category,
            "featured": featured,
            "stock": stock,
        }

        # only update image if a new one was uploaded
        if img and img.filename:
            updated_fields["img"] = save_image(img)  # ← uses save_image now

        await db.products.update_one(
            {"_id": ObjectId(id)},
            {"$set": updated_fields}
        )

        updated_product = await db.products.find_one({"_id": ObjectId(id)})
        return {"message": "Product updated successfully", "product": format_product(updated_product)}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))