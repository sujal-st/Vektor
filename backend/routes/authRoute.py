from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database import db
from jose import jwt
from datetime import datetime, timedelta
import bcrypt
import os
from dotenv import load_dotenv


load_dotenv()

router=APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET")
ADMIN_SECRET= os.getenv("ADMIN_SECRET")

class AdminSignupRequest(BaseModel):
    userName: str
    email: EmailStr
    password: str
    admin_secret: str

class LoginREquest(BaseModel):
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    userName: str
    email: EmailStr
    password: str


@router.post("/signup")
async def signup(body: SignupRequest):
    try:

        existing_user = await db.users.find_one({"email": body.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        salt=bcrypt.gensalt(10)
        hashed_password = bcrypt.hashpw(body.password.encode(), salt).decode()

        new_user={
            "userName": body.userName,
            "email": body.email,
            "password": hashed_password,
            "is_admin": False
        }

        await db.users.insert_one(new_user)

        return {"message":"User registered successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login")
async def login(body: LoginREquest):
    try:
        user = await db.users.find_one({"email": body.email})
        if not user:
            raise HTTPException(status_code=400, detail="Invalid email or password")

        is_match= bcrypt.checkpw(body.password.encode(), user["password"].encode())
        if not is_match:
            raise HTTPException(status_code=400, detail="Invalid email or password")

        token= jwt.encode(
            {
                "id": str(user["_id"]),
                "is_admin": user["is_admin"],
                "userName": user["userName"],
                "exp": datetime.utcnow()+timedelta(days=1)
            },
            JWT_SECRET,
            algorithm="HS256"
        )

        return{
            "message": "Login successful",
            "token": token,
            "user":{
                "id": str(user["_id"]),
                "userName": user["userName"],
                "email": user["email"],
                "is_admin": user["is_admin"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/signup")
async def admin_signup(body: AdminSignupRequest):
    try:

        if body.admin_secret != ADMIN_SECRET:
            raise HTTPException(status_code=403, detail="Invalid admin secret")

        existing_user = await db.users.find_one({"email": body.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")

        salt= bcrypt.gensalt(10)
        hashed_password= bcrypt.hashpw(body.password.encode(), salt).decode() 

        new_admin={
            "userName": body.userName,
            "email": body.email,
            "password": hashed_password,
            "is_admin": True
        }

        await db.users.insert_one(new_admin)
        return {"message": "Admin registered successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))