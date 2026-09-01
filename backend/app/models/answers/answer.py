"""Answer model — stores a candidate's response to a question (BE-16)."""
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Answer(Base):
    __tablename__ = "answers"

    answer_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    attempt_id = Column(Integer, ForeignKey("attempts.attempt_id"), nullable=False)
    question_id = Column(
        Integer, ForeignKey("questions.question_id"), nullable=False
    )
    answer_text = Column(Text, nullable=True)
    selected_option_id = Column(
        Integer, ForeignKey("question_options.option_id"), nullable=True
    )
    code_submission = Column(Text, nullable=True)
    programming_language = Column(String(50), nullable=True)
    score = Column(Numeric(5, 2), nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)

    attempt = relationship("Attempt", back_populates="answers")
    question = relationship("Question", back_populates="answers")
