from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.item import PyObjectId

class ResearchAreaBase(BaseModel):
    title: str
    description: str
    icon: str  # FontAwesome icon name (e.g., 'faBrain')
    color: str # Tailwind text color class (e.g., 'text-purple-600')
    bg_color: str # Tailwind bg color class (e.g., 'bg-purple-50')
    number: str # Display number (e.g., '01')
    link: Optional[str] = None # CTA Link
    
class ResearchAreaCreate(ResearchAreaBase):
    pass

class ResearchAreaUpdate(ResearchAreaBase):
    title: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    bg_color: Optional[str] = None
    number: Optional[str] = None
    link: Optional[str] = None

class ResearchArea(ResearchAreaBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
