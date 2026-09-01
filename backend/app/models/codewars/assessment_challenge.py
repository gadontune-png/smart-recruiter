"""Link table between assessments and Codewars challenges (BE-23)."""
from sqlalchemy import Column, ForeignKey, Integer

from app.core.database import Base


class AssessmentChallenge(Base):
    __tablename__ = "assessment_challenges"

    assessment_challenge_id = Column(
        Integer, primary_key=True, autoincrement=True, index=True
    )
    assessment_id = Column(
        Integer, ForeignKey("assessments.assessment_id"), nullable=False
    )
    challenge_id = Column(
        Integer, ForeignKey("codewars_challenges.challenge_id"), nullable=False
    )
    question_id = Column(
        Integer, ForeignKey("questions.question_id"), nullable=True
    )
