from fastapi import FastAPI

from app.core.database import Base, engine
from app.api.auth.routes import router as auth_router
from app.api.invitations.routes import router as invitations_router
from app.api.notifications.routes import router as notifications_router
from app.api.results.routes import router as results_router
from app.api.feedback.routes import router as feedback_router
from app.api.results.codewars_routes import router as codewars_router
from app.api.assessments.routes import router as assessments_router
from app.api.questions.routes import router as questions_router
from app.api.submissions.routes import router as submissions_router

from app.models.user import User
from app.models.invitations.invitation import Invitation
from app.models.notifications.notification import Notification
from app.models.results.result import Result
from app.models.feedback.feedback import Feedback
from app.models.assessments.assessment import Assessment
from app.models.questions.question import Question
from app.models.answers.answer import Answer
from app.models.attempts.attempt import Attempt
from app.models.submissions.code_submission import CodeSubmission
from app.models.codewars.challenge import CodewarsChallenge
from app.models.codewars.assessment_challenge import AssessmentChallenge

app = FastAPI(title="Smart Recruiter API")

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(assessments_router)
app.include_router(questions_router)
app.include_router(submissions_router)
app.include_router(invitations_router)
app.include_router(notifications_router)
app.include_router(results_router)
app.include_router(feedback_router)
app.include_router(codewars_router)


@app.get("/health")
def health():
    return {"status": "ok", "message": "Smart Recruiter API is running"}


@app.get("/")
def root():
    return {
        "name": "Smart Recruiter API",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "assessments": "/api/assessments",
            "questions": "/api/questions",
            "submissions": "/api/submissions",
            "health": "/health",
        },
    }