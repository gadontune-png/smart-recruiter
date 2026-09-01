"""Assessment taking, answers & submission (BE-13, BE-15, BE-16, BE-17, BE-18)."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_interviewee
from app.models.answers.answer import Answer
from app.models.assessments.assessment import Assessment
from app.models.attempts.attempt import Attempt, AttemptStatus
from app.models.invitations.invitation import Invitation, InvitationStatus
from app.models.questions.option import QuestionOption
from app.models.questions.question import Question
from app.models.user import User
from app.schemas.attempt import AnswerOut, AnswerSave, AttemptOut
from app.schemas.question import CandidateQuestionOut
from app.services import grading_service

router = APIRouter(tags=["attempts"])


def _remaining_seconds(attempt: Attempt, time_limit: int) -> int | None:
    if attempt.started_at is None:
        return None
    elapsed = (
        grading_service.utc_now() - grading_service.as_aware(attempt.started_at)
    ).total_seconds()
    remaining = int(time_limit * 60 - elapsed)
    return max(remaining, 0)


def _active_attempt(db, assessment_id, user_id):
    return (
        db.query(Attempt)
        .filter(
            Attempt.assessment_id == assessment_id,
            Attempt.interviewee_id == user_id,
            Attempt.status.in_([AttemptStatus.NOT_STARTED, AttemptStatus.IN_PROGRESS]),
        )
        .order_by(Attempt.attempt_id.desc())
        .first()
    )


def _assert_enrolled(db, assessment_id, user: User):
    invitation = (
        db.query(Invitation)
        .filter(
            Invitation.assessment_id == assessment_id,
            Invitation.interviewee_id == user.user_id,
            Invitation.status == InvitationStatus.ACCEPTED,
        )
        .first()
    )
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must accept the invitation before taking this assessment",
        )
    assessment = (
        db.query(Assessment)
        .filter(Assessment.assessment_id == assessment_id)
        .first()
    )
    if not assessment or assessment.status != "PUBLISHED":
        raise HTTPException(
            status_code=400, detail="Assessment is not available"
        )
    return assessment


@router.post(
    "/api/assessments/{assessment_id}/start",
    response_model=AttemptOut,
)
def start_attempt(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_interviewee),
):
    assessment = _assert_enrolled(db, assessment_id, current_user)
    attempt = _active_attempt(db, assessment_id, current_user.user_id)
    if attempt is None:
        attempt = Attempt(
            assessment_id=assessment_id,
            interviewee_id=current_user.user_id,
            status=AttemptStatus.NOT_STARTED,
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)

    # Auto-submit if the previous session already expired.
    if attempt.status == AttemptStatus.IN_PROGRESS and grading_service.is_expired(
        attempt, assessment.time_limit_minutes
    ):
        grading_service.finalize_attempt(db, attempt, assessment.time_limit_minutes)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Previous attempt expired and was auto-submitted",
        )

    if attempt.status == AttemptStatus.NOT_STARTED:
        attempt.status = AttemptStatus.IN_PROGRESS
        attempt.started_at = grading_service.utc_now()
        db.commit()
        db.refresh(attempt)

    result = AttemptOut.model_validate(attempt)
    result.remaining_seconds = _remaining_seconds(
        attempt, assessment.time_limit_minutes
    )
    return result


@router.get(
    "/api/assessments/{assessment_id}/questions",
    response_model=List[CandidateQuestionOut],
)
def get_attempt_questions(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_interviewee),
):
    assessment = _assert_enrolled(db, assessment_id, current_user)
    attempt = _active_attempt(db, assessment_id, current_user.user_id)
    if attempt is None or attempt.status != AttemptStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=400, detail="No active attempt. Start the assessment first."
        )
    if grading_service.is_expired(attempt, assessment.time_limit_minutes):
        grading_service.finalize_attempt(db, attempt, assessment.time_limit_minutes)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attempt expired and was auto-submitted",
        )
    questions = (
        db.query(Question)
        .filter(Question.assessment_id == assessment_id)
        .order_by(Question.order_number)
        .all()
    )
    return questions


@router.get("/api/attempts/{attempt_id}", response_model=AttemptOut)
def get_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_interviewee),
):
    attempt = db.query(Attempt).filter(Attempt.attempt_id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.interviewee_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your attempt"
        )
    assessment = (
        db.query(Assessment)
        .filter(Assessment.assessment_id == attempt.assessment_id)
        .first()
    )
    time_limit = assessment.time_limit_minutes if assessment else 60
    result = AttemptOut.model_validate(attempt)
    result.remaining_seconds = _remaining_seconds(attempt, time_limit)
    return result


@router.post("/api/attempts/{attempt_id}/answers", response_model=AnswerOut)
def save_answer(
    attempt_id: int,
    payload: AnswerSave,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_interviewee),
):
    attempt = db.query(Attempt).filter(Attempt.attempt_id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.interviewee_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your attempt"
        )
    assessment = (
        db.query(Assessment)
        .filter(Assessment.assessment_id == attempt.assessment_id)
        .first()
    )
    time_limit = assessment.time_limit_minutes if assessment else 60
    if attempt.status != AttemptStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=400, detail="Attempt is not in progress"
        )
    if grading_service.is_expired(attempt, time_limit):
        grading_service.finalize_attempt(db, attempt, time_limit)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attempt expired and was auto-submitted",
        )

    question = (
        db.query(Question).filter(Question.question_id == payload.question_id).first()
    )
    if not question or question.assessment_id != attempt.assessment_id:
        raise HTTPException(
            status_code=400, detail="Question does not belong to this assessment"
        )

    if payload.selected_option_id is not None:
        option = (
            db.query(QuestionOption)
            .filter(
                QuestionOption.option_id == payload.selected_option_id,
                QuestionOption.question_id == question.question_id,
            )
            .first()
        )
        if not option:
            raise HTTPException(
                status_code=400, detail="Invalid option for this question"
            )

    answer = (
        db.query(Answer)
        .filter(
            Answer.attempt_id == attempt.attempt_id,
            Answer.question_id == payload.question_id,
        )
        .first()
    )
    if answer is None:
        answer = Answer(attempt_id=attempt.attempt_id, question_id=payload.question_id)
        db.add(answer)
    answer.answer_text = payload.answer_text
    answer.code_submission = payload.code_submission
    answer.programming_language = payload.programming_language
    answer.selected_option_id = payload.selected_option_id
    answer.submitted_at = grading_service.utc_now()
    db.commit()
    db.refresh(answer)
    return answer


@router.get(
    "/api/attempts/{attempt_id}/answers",
    response_model=List[AnswerOut],
)
def get_answers(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_interviewee),
):
    attempt = db.query(Attempt).filter(Attempt.attempt_id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.interviewee_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your attempt"
        )
    return (
        db.query(Answer).filter(Answer.attempt_id == attempt.attempt_id).all()
    )


@router.post("/api/attempts/{attempt_id}/submit", response_model=AttemptOut)
def submit_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_interviewee),
):
    attempt = db.query(Attempt).filter(Attempt.attempt_id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.interviewee_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your attempt"
        )
    assessment = (
        db.query(Assessment)
        .filter(Assessment.assessment_id == attempt.assessment_id)
        .first()
    )
    time_limit = assessment.time_limit_minutes if assessment else 60
    if attempt.status not in (
        AttemptStatus.IN_PROGRESS,
        AttemptStatus.NOT_STARTED,
    ):
        raise HTTPException(
            status_code=400, detail="Attempt already submitted"
        )
    finalized = grading_service.finalize_attempt(db, attempt, time_limit)
    result = AttemptOut.model_validate(finalized)
    result.remaining_seconds = 0
    return result
