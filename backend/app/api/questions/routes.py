from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_recruiter
from app.models.questions.question import Question
from app.models.questions.option import QuestionOption
from app.models.user import User
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionOut
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/questions", tags=["questions"])

notification_service = NotificationService()


@router.get("", response_model=List[QuestionOut])
@router.get("/", response_model=List[QuestionOut])
def list_questions(assessment_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Question)
    if assessment_id is not None:
        query = query.filter(Question.assessment_id == assessment_id)
    return query.order_by(Question.order_number).all()


@router.get("/{question_id}", response_model=QuestionOut)
def get_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.question_id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.post("", response_model=QuestionOut, status_code=201)
@router.post("/", response_model=QuestionOut, status_code=201)
def create_question(
    payload: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    data = payload.model_dump()
    options_data = data.pop("options", [])
    data.pop("difficulty", None)
    if not data.get("assessment_id"):
        raise HTTPException(status_code=400, detail="assessment_id is required")
    question = Question(**{k: v for k, v in data.items() if k in Question.__table__.columns.keys()})
    db.add(question)
    db.flush()
    for option_data in options_data:
        question.options.append(
            QuestionOption(
                option_text=option_data.option_text,
                is_correct=option_data.get("is_correct", False),
            )
        )
    db.commit()
    db.refresh(question)
    return question


@router.patch("/{question_id}", response_model=QuestionOut)
def update_question(
    question_id: int,
    payload: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
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
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    question = db.query(Question).filter(Question.question_id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()
    return {"detail": "Question deleted"}


@router.post("/send-by-email")
def send_question_by_email(
    recipient_email: str,
    recipient_name: str,
    assessment_title: str,
    question_text: str,
    question_type: str,
    points: int,
    deadline: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    success = notification_service.send_question_assigned_email(
        recipient_email,
        recipient_name,
        assessment_title,
        question_text,
        question_type,
        points,
        deadline,
    )
    return {
        "success": success,
        "message": "Question notification email sent successfully" if success else "Failed to send email",
    }


@router.post("/send-by-email/bulk")
def send_questions_bulk_by_email(
    recipient_emails: List[str],
    recipient_names: List[str],
    assessment_title: str,
    question_text: str,
    question_type: str,
    points: int,
    deadline: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    results = []
    for email, name in zip(recipient_emails, recipient_names):
        success = notification_service.send_question_assigned_email(
            recipient_email=email,
            recipient_name=name,
            assessment_title=assessment_title,
            question_text=question_text,
            question_type=question_type,
            points=points,
            deadline=deadline,
        )
        results.append({"email": email, "success": success})

    return {
        "total": len(results),
        "sent": sum(1 for r in results if r["success"]),
        "failed": sum(1 for r in results if not r["success"]),
        "results": results,
    }
