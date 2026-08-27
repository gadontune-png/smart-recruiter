import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Boolean

from app.core.database import Base
from app.models.invitations.invitation import GUID


class Result(Base):
    """
    Stores a computed score snapshot for one submission.
    NOTE: depends on Member 3's submission/answer tables for the actual
    scoring calculation — this model just stores the final numbers so
    results can be queried/sorted quickly without re-scoring every time.
    """

    __tablename__ = "results"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    submission_id = Column(GUID(), nullable=False, unique=True)  # FK to Member 3's submissions
    assessment_id = Column(GUID(), nullable=False)  # FK to Member 2's assessments
    interviewee_id = Column(GUID(), nullable=False)  # FK to Member 1's users
    total_score = Column(Float, nullable=False, default=0.0)
    grade_released = Column(Boolean, default=False, nullable=False)
    calculated_at = Column(DateTime, default=datetime.utcnow)

