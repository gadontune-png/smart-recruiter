from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.assessments.assessment import Assessment
from app.models.questions.question import Question
from app.schemas.assessment import AssessmentCreate, AssessmentUpdate, AssessmentOut, AssessmentDetailOut, QuestionCreate, QuestionOut

router = APIRouter(prefix="/api/assessments", tags=["assessments"])


@router.get("/", response_model=list[AssessmentOut])
def list_assessments(db: Session = Depends(get_db)):
    return db.query(Assessment).filter(Assessment.status == "published").all()


@router.get("/my", response_model=list[AssessmentOut])
def list_my_assessments(db: Session = Depends(get_db)):
    return db.query(Assessment).all()


@router.get("/{assessment_id}", response_model=AssessmentDetailOut)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.assessment_id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


@router.post("/", response_model=AssessmentOut, status_code=201)
def create_assessment(payload: AssessmentCreate, db: Session = Depends(get_db)):
    assessment = Assessment(**payload.model_dump())
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


@router.patch("/{assessment_id}", response_model=AssessmentOut)
def update_assessment(assessment_id: int, payload: AssessmentUpdate, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.assessment_id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(assessment, key, value)
    db.commit()
    db.refresh(assessment)
    return assessment


@router.delete("/{assessment_id}")
def delete_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.assessment_id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    db.delete(assessment)
    db.commit()
    return {"detail": "Assessment deleted"}


@router.post("/{assessment_id}/questions", response_model=QuestionOut, status_code=201)
def add_question(assessment_id: int, payload: QuestionCreate, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.assessment_id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    question = Question(**payload.model_dump(), assessment_id=assessment_id)
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.get("/{assessment_id}/questions", response_model=list[QuestionOut])
def list_questions(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.assessment_id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment.questions