import uuid
import enum
from datetime import datetime

from sqlalchemy import Column, String, Text, Integer, DateTime, Enum

from app.core.database import Base
from app.models.invitations.invitation import GUID


class AssessmentStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)

    duration = Column(Integer, nullable=False)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)

    status = Column(
        Enum(AssessmentStatus),
        default=AssessmentStatus.DRAFT,
        nullable=False,
    )

    recruiter_id = Column(GUID(), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )