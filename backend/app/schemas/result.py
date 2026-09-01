from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ResultCreate(BaseModel):
    submission_id: int
    assessment_id: int
    interviewee_id: int
    total_score: float


class ResultOut(BaseModel):
    id: int
    submission_id: int
    assessment_id: int
    interviewee_id: int
    total_score: float
    grade_released: bool
    calculated_at: datetime

    model_config = ConfigDict(from_attributes=True)