from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class FeedbackCreate(BaseModel):
    answer_id: Optional[int] = None
    comment: str
    score: Optional[float] = None


class FeedbackOut(BaseModel):
    feedback_id: int
    answer_id: int
    recruiter_id: int
    comment: str
    score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
