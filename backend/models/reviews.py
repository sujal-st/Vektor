from pydantic import BaseModel
from typing import Optional

class Review(BaseModel):
    product_id: str
    text: str
    rating: int  # 1-5 stars