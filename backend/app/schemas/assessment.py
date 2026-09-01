from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.question import QuestionOut


class AssessmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit_minutes: int = 60
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class AssessmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    assessment_id: int
    recruiter_id: int
    title: str
    description: Optional[str] = None
    time_limit_minutes: int
    status: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class AssessmentDetailOut(AssessmentOut):
    questions: List[QuestionOut] = []