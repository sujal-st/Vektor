from pydantic import BaseModel
from typing import Optional

class Product(BaseModel):
    title: str
    description: str
    category:str
    price: float
    img: str
    featured: bool=False
    stock: int
    admin_id: Optional[str]= None