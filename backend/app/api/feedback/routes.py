import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.feedback.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackOut

router = APIRouter(prefix="/api", tags=["feedback"])


@router.post("/feedback", response_model=FeedbackOut)
def create_feedback(payload: FeedbackCreate, db: Session = Depends(get_db)):
    feedback = Feedback(**payload.model_dump())
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("/answers/{answer_id}/feedback", response_model=List[FeedbackOut])
def get_feedback_for_answer(answer_id: uuid.UUID, db: Session = Depends(get_db)):
    return db.query(Feedback).filter(Feedback.answer_id == answer_id).all()


@router.patch("/feedback/{feedback_id}/release", response_model=FeedbackOut)
def release_feedback(feedback_id: uuid.UUID, db: Session = Depends(get_db)):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    feedback.released = True
    db.commit()
    db.refresh(feedback)
    return feedback

