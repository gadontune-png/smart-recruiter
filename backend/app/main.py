from fastapi import FastAPI

from app.core.database import Base, engine
from app.api.invitations.routes import router as invitations_router
from app.api.notifications.routes import router as notifications_router
from app.api.results.routes import router as results_router
from app.api.feedback.routes import router as feedback_router
from app.api.results.codewars_routes import router as codewars_router

# Import models so SQLAlchemy registers their tables before create_all
from app.models.invitations.invitation import Invitation  # noqa: F401
from app.models.notifications.notification import Notification  # noqa: F401
from app.models.results.result import Result  # noqa: F401
from app.models.feedback.feedback import Feedback  # noqa: F401
from app.models.assessments.assessment import Assessment  # noqa: F401

app = FastAPI(title="Smart Recruiter API")

Base.metadata.create_all(bind=engine)

app.include_router(invitations_router)
app.include_router(notifications_router)
app.include_router(results_router)
app.include_router(feedback_router)
app.include_router(codewars_router)


@app.get("/health")
def health():
    return {"status": "ok"}

