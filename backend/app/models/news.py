from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.item import PyObjectId

class NewsBase(BaseModel):
    title: str
    description: str
    date: datetime = Field(default_factory=datetime.utcnow)
    is_published: bool = True
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None

class NewsCreate(NewsBase):
    pass

class NewsUpdate(NewsBase):
    pass

class News(NewsBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class NewsPagination(BaseModel):
    items: List[News]
    total: int
    page: int
    size: int
    pages: int
