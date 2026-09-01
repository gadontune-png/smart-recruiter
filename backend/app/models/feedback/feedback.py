import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Text, Boolean, Integer, Numeric

from app.core.database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    feedback_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    answer_id = Column(Integer, nullable=False)
    recruiter_id = Column(Integer, nullable=False)
    comment = Column(Text, nullable=False)
    score = Column(Numeric(5, 2), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

