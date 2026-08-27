import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.assessments.assessment import Assessment, AssessmentStatus
from app.models.questions.question import Question, QuestionType
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

    if assessment.status in (
        AssessmentStatus.PUBLISHED,
        AssessmentStatus.CLOSED,
    ):
        raise HTTPException(
            status_code=400,
            detail="Published or closed assessments cannot be modified",
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

    if assessment.status == AssessmentStatus.PUBLISHED:
        raise HTTPException(
            status_code=400,
            detail="Published assessments cannot be deleted",
        )

    if assessment.status in (
        AssessmentStatus.PUBLISHED,
        AssessmentStatus.CLOSED,
    ):
        raise HTTPException(
            status_code=400,
            detail="Published or closed assessments cannot be modified",
         )

    db.delete(assessment)
    db.commit()

    return None


@router.get("/{assessment_id}/review")
def review_assessment(
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

    questions = (
        db.query(Question)
        .filter(Question.assessment_id == assessment_id)
        .all()
    )

    errors = []

    if not assessment.title.strip():
        errors.append("Assessment title is required")

    if assessment.duration <= 0:
        errors.append("Assessment duration must be greater than 0")

    if not questions:
        errors.append("Assessment must contain at least one question")

    for index, question in enumerate(questions, start=1):
        if not question.question_text.strip():
            errors.append(f"Question {index} must have question text")

        if question.points <= 0:
            errors.append(f"Question {index} must have positive points")

        if question.question_type == QuestionType.MULTIPLE_CHOICE:
            if not question.options or len(question.options) < 2:
                errors.append(
                    f"Question {index} must have at least 2 options"
                )

            if not question.correct_answer:
                errors.append(
                    f"Question {index} must have a correct answer"
                )

            elif question.options and question.correct_answer not in question.options:
                errors.append(
                    f"Question {index} correct answer must match an option"
                )

        elif question.question_type == QuestionType.CODING:
            if not question.coding_config:
                errors.append(
                    f"Question {index} must have coding configuration"
                )

        elif question.question_type == QuestionType.SUBJECTIVE:
            if question.options:
                errors.append(
                    f"Question {index} cannot have options"
                )

            if question.correct_answer:
                errors.append(
                    f"Question {index} cannot have a correct answer"
                )

    return {
        "assessment_id": assessment.id,
        "status": assessment.status,
        "question_count": len(questions),
        "ready_to_publish": len(errors) == 0,
        "errors": errors,
    }


@router.post("/{assessment_id}/publish", response_model=AssessmentOut)
def publish_assessment(
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

    if assessment.status == AssessmentStatus.CLOSED:
        raise HTTPException(
            status_code=400,
            detail="Closed assessments cannot be published",
        )

    if assessment.status == AssessmentStatus.PUBLISHED:
        raise HTTPException(
            status_code=400,
            detail="Assessment is already published",
        )

    questions = (
        db.query(Question)
        .filter(Question.assessment_id == assessment_id)
        .all()
    )

    if not questions:
        raise HTTPException(
            status_code=400,
            detail="Assessment must contain at least one question",
        )

    for index, question in enumerate(questions, start=1):
        if not question.question_text.strip():
            raise HTTPException(
                status_code=400,
                detail=f"Question {index} must have question text",
            )

        if question.points <= 0:
            raise HTTPException(
                status_code=400,
                detail=f"Question {index} must have positive points",
            )

        if question.question_type == QuestionType.MULTIPLE_CHOICE:
            if not question.options or len(question.options) < 2:
                raise HTTPException(
                    status_code=400,
                    detail=f"Question {index} must have at least 2 options",
                )

            if not question.correct_answer:
                raise HTTPException(
                    status_code=400,
                    detail=f"Question {index} must have a correct answer",
                )

            if question.correct_answer not in question.options:
                raise HTTPException(
                    status_code=400,
                    detail=f"Question {index} correct answer must match an option",
                )

        elif question.question_type == QuestionType.CODING:
            if not question.coding_config:
                raise HTTPException(
                    status_code=400,
                    detail=f"Question {index} must have coding configuration",
                )

    assessment.status = AssessmentStatus.PUBLISHED

    db.commit()
    db.refresh(assessment)

    return assessment
