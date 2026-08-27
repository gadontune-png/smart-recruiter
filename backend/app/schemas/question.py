import uuid
from typing import Any, List, Optional

from pydantic import BaseModel, Field, model_validator

from app.models.questions.question import QuestionType


class QuestionBase(BaseModel):
    question_text: str = Field(min_length=1)
    question_type: QuestionType
    points: float = Field(default=1.0, gt=0)
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    coding_config: Optional[dict[str, Any]] = None

    @model_validator(mode="after")
    def validate_question(self):
        if self.question_type == QuestionType.MULTIPLE_CHOICE:
            if not self.options or len(self.options) < 2:
                raise ValueError(
                    "Multiple-choice questions must have at least 2 options"
                )

            if not self.correct_answer:
                raise ValueError(
                    "Multiple-choice questions must have a correct answer"
                )

            if self.correct_answer not in self.options:
                raise ValueError(
                    "Correct answer must be one of the provided options"
                )

        elif self.question_type == QuestionType.SUBJECTIVE:
            if self.options:
                raise ValueError(
                    "Subjective questions cannot have options"
                )

            if self.correct_answer:
                raise ValueError(
                    "Subjective questions cannot have a correct answer"
                )

        elif self.question_type == QuestionType.CODING:
            if not self.coding_config:
                raise ValueError(
                    "Coding questions must have coding configuration"
                )

        return self


class QuestionCreate(QuestionBase):
    assessment_id: uuid.UUID


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = Field(default=None, min_length=1)
    question_type: Optional[QuestionType] = None
    points: Optional[float] = Field(default=None, gt=0)
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    coding_config: Optional[dict[str, Any]] = None


class QuestionOut(QuestionBase):
    id: uuid.UUID
    assessment_id: uuid.UUID

    class Config:
        from_attributes = True