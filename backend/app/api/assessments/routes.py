from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_recruiter
from app.models.assessments.assessment import Assessment, AssessmentStatus
from app.models.attempts.attempt import Attempt
from app.models.questions.question import Question
from app.models.questions.option import QuestionOption
from app.models.results.result import Result
from app.models.user import User
from app.schemas.assessment import AssessmentCreate, AssessmentUpdate, AssessmentOut, AssessmentDetailOut
from app.schemas.question import QuestionCreate, QuestionOut

router = APIRouter(prefix="/api/assessments", tags=["assessments"])


@router.get("", response_model=list[AssessmentOut])
@router.get("/", response_model=list[AssessmentOut])
def list_assessments(db: Session = Depends(get_db)):
    return (
        db.query(Assessment)
        .filter(Assessment.status == AssessmentStatus.PUBLISHED)
        .all()
    )


@router.get("/my", response_model=list[AssessmentOut])
def list_my_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Assessment)
        .filter(Assessment.recruiter_id == current_user.user_id)
        .all()
    )


@router.get("/{assessment_id}", response_model=AssessmentDetailOut)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.assessment_id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


@router.post("", response_model=AssessmentOut, status_code=201)
@router.post("/", response_model=AssessmentOut, status_code=201)
def create_assessment(
    payload: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    assessment = Assessment(**payload.model_dump(), recruiter_id=current_user.user_id)
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


def _get_owned_assessment(assessment_id: int, user: User, db: Session) -> Assessment:
    assessment = db.query(Assessment).filter(Assessment.assessment_id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    if assessment.recruiter_id != user.user_id:
        raise HTTPException(status_code=403, detail="You do not own this assessment")
    return assessment


@router.patch("/{assessment_id}", response_model=AssessmentOut)
def update_assessment(
    assessment_id: int,
    payload: AssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    assessment = _get_owned_assessment(assessment_id, current_user, db)
    if assessment.status == AssessmentStatus.PUBLISHED:
        raise HTTPException(status_code=400, detail="Cannot modify a published assessment")
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(assessment, key, value)
    db.commit()
    db.refresh(assessment)
    return assessment


@router.delete("/{assessment_id}")
def delete_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    assessment = _get_owned_assessment(assessment_id, current_user, db)
    all_submitted = (
        db.query(Attempt)
        .filter(
            Attempt.assessment_id == assessment_id,
            Attempt.status.in_(["SUBMITTED", "AUTO_SUBMITTED"]),
        )
        .count()
    )
    has_results = (
        db.query(Result)
        .filter(Result.assessment_id == assessment_id)
        .count()
    )
    if all_submitted == 0 and has_results == 0:
        db.delete(assessment)
        db.commit()
        return {"detail": "Assessment deleted"}
    assessment.status = AssessmentStatus.ARCHIVED
    db.commit()
    db.refresh(assessment)
    return {
        "detail": "Assessment archived. Results and history are preserved.",
        "assessment": assessment,
    }


@router.post("/{assessment_id}/publish", response_model=AssessmentOut)
def publish_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    assessment = _get_owned_assessment(assessment_id, current_user, db)
    if not assessment.questions:
        raise HTTPException(status_code=400, detail="Assessment must have at least one question before publishing")
    assessment.status = AssessmentStatus.PUBLISHED
    db.commit()
    db.refresh(assessment)
    return assessment


@router.post("/{assessment_id}/questions", response_model=QuestionOut, status_code=201)
def add_question(
    assessment_id: int,
    payload: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    assessment = _get_owned_assessment(assessment_id, current_user, db)
    data = payload.model_dump()
    options_data = data.pop("options", [])
    data.pop("assessment_id", None)
    question = Question(**data, assessment_id=assessment_id)
    db.add(question)
    db.flush()

    for option_data in options_data:
        db.add(
            QuestionOption(
                question_id=question.question_id,
                option_text=option_data["option_text"],
                is_correct=option_data.get("is_correct", False),
            )
        )
    db.commit()
    db.refresh(question)
    return question
