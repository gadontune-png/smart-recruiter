import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.results.result import Result
from app.schemas.result import ResultCreate, ResultOut

router = APIRouter(prefix="/api", tags=["results"])


@router.post("/results", response_model=ResultOut)
def record_result(payload: ResultCreate, db: Session = Depends(get_db)):
    result = Result(**payload.model_dump())
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


@router.get("/results/{submission_id}", response_model=ResultOut)
def get_result(submission_id: uuid.UUID, db: Session = Depends(get_db)):
    result = db.query(Result).filter(Result.submission_id == submission_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result


@router.get("/assessments/{assessment_id}/results", response_model=List[ResultOut])
def list_results_for_assessment(assessment_id: uuid.UUID, db: Session = Depends(get_db)):
    return (
        db.query(Result)
        .filter(Result.assessment_id == assessment_id)
        .order_by(Result.total_score.desc())
        .all()
    )


@router.post("/assessments/{assessment_id}/release-grades")
def release_grades(assessment_id: uuid.UUID, db: Session = Depends(get_db)):
    results = db.query(Result).filter(Result.assessment_id == assessment_id).all()
    for r in results:
        r.grade_released = True
    db.commit()
    return {"assessment_id": assessment_id, "released_count": len(results)}

