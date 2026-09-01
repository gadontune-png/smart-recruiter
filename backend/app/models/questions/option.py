"""Question option (MCQ answer choice) model (BE-08)."""
from sqlalchemy import Boolean, Column, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class QuestionOption(Base):
    __tablename__ = "question_options"

    option_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    question_id = Column(
        Integer, ForeignKey("questions.question_id"), nullable=False
    )
    option_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)

    question = relationship("Question", back_populates="options")
