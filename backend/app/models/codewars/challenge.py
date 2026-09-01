"""Codewars challenge model (BE-23)."""
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    String,
    Text,
    func,
)

from app.core.database import Base


class CodewarsChallenge(Base):
    __tablename__ = "codewars_challenges"

    challenge_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    external_id = Column(String(100), unique=True, nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String(50), nullable=True)
    category = Column(String(100), nullable=True)
    url = Column(String(500), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
