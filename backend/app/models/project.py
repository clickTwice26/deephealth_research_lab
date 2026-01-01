from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.item import PyObjectId

class ProjectBase(BaseModel):
    title: str
    description: str
    tags: List[str] = []
    image_url: Optional[str] = None
    link: Optional[str] = None
    is_active: bool = True

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None
    link: Optional[str] = None
    is_active: Optional[bool] = None

class Project(ProjectBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
