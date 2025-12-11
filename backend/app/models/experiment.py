from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime
from app.models.item import PyObjectId

class ExperimentStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"
    FAILED = "failed"

class ExperimentBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: ExperimentStatus = ExperimentStatus.ACTIVE

class ExperimentCreate(ExperimentBase):
    pass

class ExperimentUpdate(ExperimentBase):
    pass

class Experiment(ExperimentBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    owner_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
