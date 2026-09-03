from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class QuestionOptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    option_id: int
    question_id: int
    option_text: str
    is_correct: bool


class QuestionOptionIn(BaseModel):
    option_text: str
    is_correct: bool = False


class QuestionCreate(BaseModel):
    assessment_id: Optional[int] = None
    question_text: str
    question_type: str
    points: int = Field(0, ge=0, le=100)
    order_number: int = 0
    description: Optional[str] = None
    starter_code: Optional[str] = None
    language: Optional[str] = None
    timelimit_seconds: Optional[int] = None
    difficulty: Optional[str] = None
    options: List[QuestionOptionIn] = []


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    points: Optional[int] = Field(None, ge=0, le=100)
    order_number: Optional[int] = None
    description: Optional[str] = None
    starter_code: Optional[str] = None
    language: Optional[str] = None
    timelimit_seconds: Optional[int] = None
    difficulty: Optional[str] = None


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
    difficulty: Optional[str] = None
    options: List[QuestionOptionOut] = []
    created_at: datetime
    updated_at: Optional[datetime] = None


class CandidateQuestionOut(BaseModel):
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
    options: List[QuestionOptionOut] = []