from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_interviewee, require_recruiter
from app.models.assessments.assessment import Assessment
from app.models.answers.answer import Answer
from app.models.feedback.feedback import Feedback
from app.models.notifications.notification import Notification
from app.models.results.result import Result
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackOut
from app.schemas.result import ResultOut

router = APIRouter(prefix="/api", tags=["results"])


class ResultDetailOut(ResultOut):
    interviewee_name: str | None = None
    assessment_title: str | None = None


def _enrich(result: Result, db: Session) -> ResultDetailOut:
    out = ResultDetailOut.model_validate(result)
    user = db.query(User).filter(User.user_id == result.interviewee_id).first()
    out.interviewee_name = user.full_name if user else None
    assessment = (
        db.query(Assessment)
        .filter(Assessment.assessment_id == result.assessment_id)
        .first()
    )
    out.assessment_title = assessment.title if assessment else None
    return out


@router.get("/me/results", response_model=List[ResultDetailOut])
def list_my_results(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_interviewee),
):
    """Return the current interviewee's released results."""
    results = (
        db.query(Result)
        .filter(
            Result.interviewee_id == current_user.user_id,
            Result.grade_released.is_(True),
        )
        .order_by(Result.calculated_at.desc())
        .all()
    )
    return [_enrich(r, db) for r in results]


@router.get("/results/{submission_id}", response_model=ResultDetailOut)
def get_result(submission_id: int, db: Session = Depends(get_db)):
    result = db.query(Result).filter(Result.submission_id == submission_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return _enrich(result, db)


@router.post("/results/{result_id}/feedback", response_model=FeedbackOut)
def add_feedback_to_result(
    result_id: int,
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    result = db.query(Result).filter(Result.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    assessment = db.query(Assessment).filter(Assessment.assessment_id == result.assessment_id).first()
    if not assessment or assessment.recruiter_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You do not own this result")

    answer = (
        db.query(Answer)
        .filter(Answer.attempt_id == result.submission_id)
        .order_by(Answer.answer_id.asc())
        .first()
    )
    if not answer:
        raise HTTPException(status_code=404, detail="No answers found for this submission")

    existing = (
        db.query(Feedback)
        .filter(Feedback.answer_id == answer.answer_id)
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

    feedback = Feedback(
        answer_id=answer.answer_id,
        recruiter_id=current_user.user_id,
        comment=payload.comment,
        score=payload.score,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("/assessments/{assessment_id}/results", response_model=List[ResultDetailOut])
def list_results_for_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    assessment = db.query(Assessment).filter(Assessment.assessment_id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    if assessment.recruiter_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You do not own this assessment")
    results = (
        db.query(Result)
        .filter(Result.assessment_id == assessment_id)
        .order_by(Result.total_score.desc())
        .all()
    )
    return [_enrich(r, db) for r in results]


@router.post("/assessments/{assessment_id}/release-grades")
def release_grades(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    assessment = db.query(Assessment).filter(Assessment.assessment_id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    if assessment.recruiter_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You do not own this assessment")
    results = db.query(Result).filter(Result.assessment_id == assessment_id).all()
    for r in results:
        if not r.grade_released:
            r.grade_released = True
            db.add(
                Notification(
                    user_id=r.interviewee_id,
                    title="Assessment result reviewed and graded",
                    message=(
                        f"Your result for '{assessment.title}' has been reviewed and "
                        f"graded. You scored {r.total_score:.0f}%. Check your results page."
                    ),
                    notification_type="result",
                )
            )
    db.commit()
    return {"assessment_id": assessment_id, "released_count": len(results)}
