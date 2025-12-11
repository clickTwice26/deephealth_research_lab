from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.item import PyObjectId

class JobBase(BaseModel):
    title: str
    type: str = "Full-time" # Contract, Full-time, etc.
    level: str = "Mid-level" # Senior, Junior, etc.
    location: str = "Remote"
    department: str
    description: str # Short summary
    responsibilities: List[str] = []
    requirements: List[str] = []
    skills: List[str] = [] # Tags like DevRel, Python
    application_link: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class JobCreate(JobBase):
    pass

class JobUpdate(JobBase):
    pass

class Job(JobBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True

class JobPagination(BaseModel):
    items: List[Job]
    total: int
    page: int
    size: int
    pages: int
