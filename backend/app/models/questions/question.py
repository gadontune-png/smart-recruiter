import enum
import uuid

from sqlalchemy import Column, String, Text, Float, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.invitations.invitation import GUID


class QuestionType(str, enum.Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    SUBJECTIVE = "subjective"
    CODING = "coding"


class Question(Base):
    __tablename__ = "questions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    assessment_id = Column(
        GUID(),
        ForeignKey("assessments.id"),
        nullable=False
    )

    question_text = Column(Text, nullable=False)

    question_type = Column(
        Enum(QuestionType),
        nullable=False
    )

    points = Column(Float, nullable=False, default=1.0)

    # Used for multiple-choice questions
    options = Column(JSON, nullable=True)

    # Used for multiple-choice questions
    correct_answer = Column(String, nullable=True)

    # Used for coding questions
    coding_config = Column(JSON, nullable=True)

    assessment = relationship("Assessment", back_populates="questions")