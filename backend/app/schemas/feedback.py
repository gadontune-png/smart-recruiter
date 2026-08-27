import uuid
from datetime import datetime

from pydantic import BaseModel


class FeedbackCreate(BaseModel):
    answer_id: uuid.UUID
    recruiter_id: uuid.UUID
    comment: str


class FeedbackOut(BaseModel):
    id: uuid.UUID
    answer_id: uuid.UUID
    recruiter_id: uuid.UUID
    comment: str
    released: bool
    created_at: datetime

    class Config:
        from_attributes = True

