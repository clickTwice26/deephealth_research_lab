from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, List
from datetime import datetime
from typing_extensions import Annotated
from app.models.item import PyObjectId

class BlogPostBase(BaseModel):
    title: str
    slug: str
    content: str
    summary: str
    cover_image: Optional[str] = None
    tags: List[str] = []
    category: str
    is_published: bool = False
    author_name: Optional[str] = None
    author_avatar: Optional[str] = None

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    cover_image: Optional[str] = None
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    is_published: Optional[bool] = None

class BlogPostInDBBase(BlogPostBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    author_id: str
    published_at: Optional[datetime] = None
    views: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class BlogPost(BlogPostInDBBase):
    pass

class BlogPostInDB(BlogPostInDBBase):
    pass
