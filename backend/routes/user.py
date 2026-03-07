from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import db
from models.user import User
from jose import jwt
from datetime import datetime, timedelta
import bcrypt
import os 
from dotenv import load_dotenv

load_dotenv()

router= APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET")

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(body:LoginRequest):
    try:
        user= await db.users.find_one({'email':body.email})
        if not user:
            raise HTTPException(status_code=400, detail="Invalid email or password")

        token: jwt.encode(
            {
                "id": str(user['_id']),
                'is_admin': user['is_admin'],
                'exp': datetime.utcnow()+timedelta(days=1)
            },
            JWT_SECRET,
            algorithm='HS256'
        )

        return{
            "message": "Login successful",
            "token": token,
            "user": {
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