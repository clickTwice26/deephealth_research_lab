from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from app.models.item import PyObjectId

class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    content: str
    author_id: str
    author_name: str # Snapshot for easier display
    created_at: datetime = Field(default_factory=datetime.utcnow)
    parent_id: Optional[str] = None

class CommunityPostBase(BaseModel):
    content: str

class CommunityPostCreate(CommunityPostBase):
    pass

class CommunityPost(CommunityPostBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    author_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    likes: List[str] = [] # List of user_ids
    dislikes: List[str] = [] # List of user_ids
    comments: List[Comment] = []
    
    # Virtual fields for aggregation results
    comments_count: int = 0
    author_details: Optional[dict] = None 

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class CommunityPostPagination(BaseModel):
    items: List[dict] # Returning dicts to include joined author data cleanly
    total: int
    page: int
    size: int
    pages: int
