import uuid
from datetime import datetime

from pydantic import BaseModel


class ResultCreate(BaseModel):
    submission_id: uuid.UUID
    assessment_id: uuid.UUID
    interviewee_id: uuid.UUID
    total_score: float


class ResultOut(BaseModel):
    id: uuid.UUID
    submission_id: uuid.UUID
    assessment_id: uuid.UUID
    interviewee_id: uuid.UUID
    total_score: float
    grade_released: bool
    calculated_at: datetime

    class Config:
        from_attributes = True

