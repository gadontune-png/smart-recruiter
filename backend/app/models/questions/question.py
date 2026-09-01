import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base


class QuestionType(str, enum.Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    SUBJECTIVE = "subjective"
    CODING = "coding"
    WHITEBOARD = "whiteboard"


class Question(Base):
    __tablename__ = "questions"

    question_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.assessment_id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(15), nullable=False)
    points = Column(Integer, nullable=False, default=0)
    order_number = Column(Integer, nullable=False, default=0)
    description = Column(Text, nullable=True)
    starter_code = Column(Text, nullable=True)
    language = Column(String(50), nullable=True)
    timelimit_seconds = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    assessment = relationship("Assessment", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question")
    answers = relationship("Answer", back_populates="question")