from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Boolean, Integer, ForeignKey

from app.core.database import Base


class Result(Base):
    """
    Stores a computed score snapshot for one submission.
    FKs use integer ids consistent with the rest of the schema.
    """

    __tablename__ = "results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    submission_id = Column(Integer, nullable=False, unique=True)
    assessment_id = Column(Integer, ForeignKey("assessments.assessment_id"), nullable=False)
    interviewee_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    total_score = Column(Float, nullable=False, default=0.0)
    grade_released = Column(Boolean, default=False, nullable=False)
    calculated_at = Column(DateTime, default=datetime.utcnow)