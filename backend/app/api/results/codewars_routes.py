from fastapi import APIRouter, HTTPException

from app.services.codewars_service import import_kata_as_question, CodewarsError

router = APIRouter(prefix="/api/codewars", tags=["codewars"])


@router.get("/katas/{kata_id}")
def get_kata_as_question(kata_id: str):
    """
    Fetches a Codewars kata and returns it shaped as a Question.
    Ready for frontend consumption in a future sprint (per BE-23 — not
    wired into the React app this sprint).
    """
    try:
        return import_kata_as_question(kata_id)
    except CodewarsError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

