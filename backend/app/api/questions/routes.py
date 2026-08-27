import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.questions.question import Question
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionOut


router = APIRouter(
    prefix="/api/questions",
    tags=["questions"],
)


@router.post("", response_model=QuestionOut, status_code=status.HTTP_201_CREATED)
def create_question(
    payload: QuestionCreate,
    db: Session = Depends(get_db),
):
    question = Question(**payload.model_dump())

    db.add(question)
    db.commit()
    db.refresh(question)

    return question


@router.get("/{question_id}", response_model=QuestionOut)
def get_question(
    question_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    question = (
        db.query(Question)
        .filter(Question.id == question_id)
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found",
        )

    return question


@router.put("/{question_id}", response_model=QuestionOut)
def update_question(
    question_id: uuid.UUID,
    payload: QuestionUpdate,
    db: Session = Depends(get_db),
):
    question = (
        db.query(Question)
        .filter(Question.id == question_id)
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found",
        )

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(question, field, value)

    db.commit()
    db.refresh(question)

    return question


@router.delete(
    "/{question_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_question(
    question_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    question = (
        db.query(Question)
        .filter(Question.id == question_id)
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found",
        )

    db.delete(question)
    db.commit()

    return None
