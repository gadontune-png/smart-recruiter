"""Assessment attempt (interviewee session) model (BE-14)."""
import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class AttemptStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    AUTO_SUBMITTED = "auto_submitted"


class Attempt(Base):
    __tablename__ = "attempts"

    attempt_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    assessment_id = Column(
        Integer, ForeignKey("assessments.assessment_id"), nullable=False
    )
    interviewee_id = Column(
        Integer, ForeignKey("users.user_id"), nullable=False
    )
    started_at = Column(DateTime(timezone=True), nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    score = Column(Numeric(5, 2), nullable=True)
    status = Column(
        Enum(AttemptStatus),
        default=AttemptStatus.NOT_STARTED,
        nullable=False,
    )

    interviewee = relationship("User", back_populates="attempts")
    assessment = relationship("Assessment", back_populates="attempts")
    answers = relationship(
        "Answer",
        back_populates="attempt",
        cascade="all, delete-orphan",
    )
