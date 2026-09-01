from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.submissions.code_submission import CodeSubmission
from app.models.attempts.attempt import Attempt
from app.models.answers.answer import Answer
from app.services.grading_service import execute_code

router = APIRouter(prefix="/api/submissions", tags=["submissions"])


@router.post("/code", response_model=dict, status_code=201)
def submit_code(payload: dict, db: Session = Depends(get_db)):
    code = payload.get("code", "")
    language = payload.get("language", "javascript")
    attempt_id = payload.get("attempt_id")
    question_id = payload.get("question_id")

    answer = Answer(
        attempt_id=attempt_id or 0,
        question_id=question_id or 0,
        answer_text=payload.get("answer_text"),
        code_submission=code,
        programming_language=language,
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)

    result = execute_code(code, language)

    submission = CodeSubmission(
        answer_id=answer.answer_id,
        language=language,
        code=code,
        execution_result=result.get("stdout", ""),
        execution_status=result.get("status", "ok"),
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return {
        "submission_id": submission.submission_id,
        "answer_id": answer.answer_id,
        "status": result.get("status", "ok"),
        "stdout": result.get("stdout", ""),
        "stderr": result.get("stderr", ""),
        "passed_tests": result.get("passed_tests", 0),
        "total_tests": result.get("total_tests", 0),
    }


@router.post("/code/run")
def run_code(payload: dict, db: Session = Depends(get_db)):
    code = payload.get("code", "")
    language = payload.get("language", "javascript")
    timeout = payload.get("timeout", 10)

    if not code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    result = execute_code(code, language, timeout=timeout)
    return result


@router.get("/{submission_id}")
def get_submission(submission_id: int, db: Session = Depends(get_db)):
    submission = db.query(CodeSubmission).filter(CodeSubmission.submission_id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission


@router.post("/{submission_id}/test")
def test_submission(submission_id: int, payload: dict, db: Session = Depends(get_db)):
    submission = db.query(CodeSubmission).filter(CodeSubmission.submission_id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    test_cases = payload.get("test_cases", [])
    result = execute_code(submission.code, submission.language)

    return {
        "submission_id": submission_id,
        "status": result.get("status", "ok"),
        "output": result.get("stdout", ""),
    }