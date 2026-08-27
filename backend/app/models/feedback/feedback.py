import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Text, Boolean

from app.core.database import Base
from app.models.invitations.invitation import GUID


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    answer_id = Column(GUID(), nullable=False)  # FK to Member 3's answers table
    recruiter_id = Column(GUID(), nullable=False)  # FK to Member 1's users table
    comment = Column(Text, nullable=False)
    released = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

