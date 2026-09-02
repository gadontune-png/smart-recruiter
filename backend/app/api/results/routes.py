from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_recruiter
from app.models.assessments.assessment import Assessment
from app.models.results.result import Result
from app.models.user import User
from app.schemas.result import ResultCreate, ResultOut

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


@router.get("/results/{submission_id}", response_model=ResultDetailOut)
def get_result(submission_id: int, db: Session = Depends(get_db)):
    result = db.query(Result).filter(Result.submission_id == submission_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return _enrich(result, db)


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
        r.grade_released = True
    db.commit()
    return {"assessment_id": assessment_id, "released_count": len(results)}
