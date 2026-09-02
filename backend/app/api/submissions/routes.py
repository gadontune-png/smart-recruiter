from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_interviewee, require_recruiter
from app.models.submissions.code_submission import CodeSubmission
from app.models.user import User
from app.services.grading_service import execute_code

router = APIRouter(prefix="/api/submissions", tags=["submissions"])


@router.post("/code/run")
def run_code(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    code = payload.get("code", "")
    language = payload.get("language", "javascript")
    timeout = min(payload.get("timeout", 10), 30)

    if not code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    result = execute_code(code, language, timeout=timeout)
    return result


@router.get("/{submission_id}")
def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    submission = db.query(CodeSubmission).filter(CodeSubmission.submission_id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission
