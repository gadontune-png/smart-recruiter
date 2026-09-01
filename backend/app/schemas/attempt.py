"""Attempt & answer schemas (BE-14, BE-16, BE-17)."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class AttemptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    attempt_id: int = Field(serialization_alias="id")
    assessment_id: int
    interviewee_id: int
    started_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    score: Optional[float] = None
    status: str
    remaining_seconds: Optional[int] = None


class AnswerSave(BaseModel):
    question_id: int
    selected_option_id: Optional[int] = None
    answer_text: Optional[str] = None
    code_submission: Optional[str] = None
    programming_language: Optional[str] = Field(default=None, max_length=50)


class AnswerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(serialization_alias="id", validation_alias="answer_id")
    attempt_id: int
    question_id: int
    answer_text: Optional[str] = None
    code_submission: Optional[str] = None
    programming_language: Optional[str] = None
    score: Optional[float] = None
    submitted_at: Optional[datetime] = None
