import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.assessments.assessment import Assessment
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentOut,
    AssessmentUpdate,
)

router = APIRouter(
    prefix="/api/assessments",
    tags=["assessments"],
)


@router.post("", response_model=AssessmentOut, status_code=201)
def create_assessment(
    payload: AssessmentCreate,
    db: Session = Depends(get_db),
):
    assessment = Assessment(**payload.model_dump())

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return assessment


@router.get("", response_model=List[AssessmentOut])
def list_assessments(
    db: Session = Depends(get_db),
):
    return db.query(Assessment).all()


@router.get("/{assessment_id}", response_model=AssessmentOut)
def get_assessment(
    assessment_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    assessment = (
        db.query(Assessment)
        .filter(Assessment.id == assessment_id)
        .first()
    )

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found",
        )

    return assessment


@router.put("/{assessment_id}", response_model=AssessmentOut)
def update_assessment(
    assessment_id: uuid.UUID,
    payload: AssessmentUpdate,
    db: Session = Depends(get_db),
):
    assessment = (
        db.query(Assessment)
        .filter(Assessment.id == assessment_id)
        .first()
    )

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found",
        )

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(assessment, field, value)

    db.commit()
    db.refresh(assessment)

    return assessment


@router.delete("/{assessment_id}", status_code=204)
def delete_assessment(
    assessment_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    assessment = (
        db.query(Assessment)
        .filter(Assessment.id == assessment_id)
        .first()
    )

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found",
        )

    db.delete(assessment)
    db.commit()

    return None
