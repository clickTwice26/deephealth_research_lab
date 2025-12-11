from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.item import PyObjectId

class PublicationBase(BaseModel):
    title: str
    authors: str
    journal: str
    date: datetime = Field(default_factory=datetime.utcnow)
    doi: str
    url: Optional[str] = None
    tags: List[str] = []
    is_featured: bool = True

class PublicationCreate(PublicationBase):
    pass

class PublicationUpdate(PublicationBase):
    pass

class Publication(PublicationBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class PublicationPagination(BaseModel):
    items: List[Publication]
    total: int
    page: int
    size: int
    pages: int
