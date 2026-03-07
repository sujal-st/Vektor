from pydantic import BaseModel, EmailStr

class User(BaseModel):
    userName: str
    email: EmailStr
    password: str
    is_admin: bool=False
