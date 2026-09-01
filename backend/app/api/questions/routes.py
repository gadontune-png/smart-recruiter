from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.questions.question import Question
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionOut
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/questions", tags=["questions"])

notification_service = NotificationService()


class QuestionEmailRequest(BaseModel):
    recipient_email: str
    recipient_name: str
    assessment_title: str
    question_text: str
    question_type: str
    points: int
    deadline: str = None


class BulkQuestionEmailRequest(BaseModel):
    recipient_emails: List[str]
    recipient_names: List[str]
    assessment_title: str
    question_text: str
    question_type: str
    points: int
    deadline: str = None


@router.get("/", response_model=List[QuestionOut])
def list_questions(db: Session = Depends(get_db)):
    return db.query(Question).all()


@router.get("/{question_id}", response_model=QuestionOut)
def get_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.question_id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.post("/", response_model=QuestionOut, status_code=201)
def create_question(payload: QuestionCreate, db: Session = Depends(get_db)):
    question = Question(**payload.model_dump())
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.patch("/{question_id}", response_model=QuestionOut)
def update_question(question_id: int, payload: QuestionUpdate, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.question_id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(question, key, value)
    db.commit()
    db.refresh(question)
    return question


@router.delete("/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.question_id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()
    return {"detail": "Question deleted"}


@router.post("/send-by-email")
def send_question_by_email(
    payload: QuestionEmailRequest,
    db: Session = Depends(get_db),
):
    success = notification_service.send_question_assigned_email(
        recipient_email=payload.recipient_email,
        recipient_name=payload.recipient_name,
        assessment_title=payload.assessment_title,
        question_text=payload.question_text,
        question_type=payload.question_type,
        points=payload.points,
        deadline=payload.deadline,
    )
    return {
        "success": success,
        "message": "Question sent to email successfully" if success else "Failed to send email",
    }


@router.post("/send-by-email/bulk")
def send_questions_bulk_by_email(
    payload: BulkQuestionEmailRequest,
    db: Session = Depends(get_db),
):
    results = []
    for email, name in zip(payload.recipient_emails, payload.recipient_names):
        success = notification_service.send_question_assigned_email(
            recipient_email=email,
            recipient_name=name,
            assessment_title=payload.assessment_title,
            question_text=payload.question_text,
            question_type=payload.question_type,
            points=payload.points,
            deadline=payload.deadline,
        )
        results.append({"email": email, "success": success})

    return {
        "total": len(results),
        "sent": sum(1 for r in results if r["success"]),
        "failed": sum(1 for r in results if not r["success"]),
        "results": results,
    }