from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_recruiter
from app.models.feedback.feedback import Feedback
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackOut

router = APIRouter(prefix="/api", tags=["feedback"])


@router.post("/feedback", response_model=FeedbackOut)
def create_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    if payload.answer_id is None:
        raise HTTPException(status_code=422, detail="answer_id is required")
    existing = (
        db.query(Feedback)
        .filter(Feedback.answer_id == payload.answer_id)
        .order_by(Feedback.feedback_id.asc())
        .first()
    )
    if existing:
        existing.comment = payload.comment
        existing.score = payload.score
        existing.recruiter_id = current_user.user_id
        db.commit()
        db.refresh(existing)
        return existing
    feedback = Feedback(**payload.model_dump(), recruiter_id=current_user.user_id)
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("/answers/{answer_id}/feedback", response_model=list[FeedbackOut])
def get_feedback_for_answer(answer_id: int, db: Session = Depends(get_db)):
    return db.query(Feedback).filter(Feedback.answer_id == answer_id).all()


@router.get("/results/{result_id}/feedback", response_model=list[FeedbackOut])
def get_feedback_for_result(result_id: int, db: Session = Depends(get_db)):
    from app.models.results.result import Result
    from app.models.answers.answer import Answer

    result = db.query(Result).filter(Result.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")

    answers = db.query(Answer).filter(Answer.attempt_id == result.submission_id).all()
    answer_ids = [a.answer_id for a in answers]
    if not answer_ids:
        return []
    return db.query(Feedback).filter(Feedback.answer_id.in_(answer_ids)).all()
