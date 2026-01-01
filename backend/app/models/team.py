from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr, HttpUrl

class SocialLinks(BaseModel):
    google_scholar: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    website: Optional[str] = None
    github: Optional[str] = None

class TeamMemberBase(BaseModel):
    name: str = Field(..., min_length=1)
    designation: str = Field(..., min_length=1)
    designation_weight: int = Field(0, description="Higher weight appears first")
    bio: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    social_links: Optional[SocialLinks] = Field(default_factory=SocialLinks)

class TeamMemberCreate(TeamMemberBase):
    pass

class TeamMemberUpdate(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    designation_weight: Optional[int] = None
    bio: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    social_links: Optional[SocialLinks] = None

class TeamMember(TeamMemberBase):
    id: str = Field(..., alias="_id")

    class Config:
        populate_by_name = True
