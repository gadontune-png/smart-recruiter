from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class AssessmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit_minutes: int
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
    questions: List["QuestionOut"] = []


class QuestionCreate(BaseModel):
    question_text: str
    question_type: str
    points: int
    order_number: int = 0
    description: Optional[str] = None
    starter_code: Optional[str] = None
    language: Optional[str] = None
    timelimit_seconds: Optional[int] = None


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    points: Optional[int] = None
    order_number: Optional[int] = None
    description: Optional[str] = None
    starter_code: Optional[str] = None
    language: Optional[str] = None
    timelimit_seconds: Optional[int] = None


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    question_id: int
    assessment_id: int
    question_text: str
    question_type: str
    points: int
    order_number: int
    description: Optional[str] = None
    starter_code: Optional[str] = None
    language: Optional[str] = None
    timelimit_seconds: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None