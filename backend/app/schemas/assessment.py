import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.assessments.assessment import AssessmentStatus


class AssessmentBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    instructions: Optional[str] = None
    duration: int = Field(gt=0)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: AssessmentStatus = AssessmentStatus.DRAFT


class AssessmentCreate(AssessmentBase):
    recruiter_id: uuid.UUID


class AssessmentUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    instructions: Optional[str] = None
    duration: Optional[int] = Field(default=None, gt=0)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[AssessmentStatus] = None


class AssessmentOut(AssessmentBase):
    id: uuid.UUID
    recruiter_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
