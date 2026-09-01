"""Code submission model — execution record for a coding answer (BE-16)."""
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)

from app.core.database import Base


class CodeSubmission(Base):
    __tablename__ = "code_submissions"

    submission_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    answer_id = Column(Integer, ForeignKey("answers.answer_id"), nullable=False)
    language = Column(String(50), nullable=False)
    code = Column(Text, nullable=False)
    execution_result = Column(Text, nullable=True)
    execution_status = Column(String(50), nullable=True)
    submitted_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
