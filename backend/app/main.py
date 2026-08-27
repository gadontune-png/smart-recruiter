"""FastAPI application entrypoint — wires auth (Member 1) + member2 routers."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine

# --- Member 1: auth models ---
from app.models import User  # noqa: F401  (register User table)

# --- Member 2: domain models (register their tables before create_all) ---
from app.models.assessments.assessment import Assessment  # noqa: F401
from app.models.feedback.feedback import Feedback  # noqa: F401
from app.models.invitations.invitation import Invitation  # noqa: F401
from app.models.notifications.notification import Notification  # noqa: F401
from app.models.questions.question import Question  # noqa: F401
from app.models.results.result import Result  # noqa: F401

# --- Routers ---
from app.api.auth import router as auth_router
from app.api.assessments.routes import router as assessments_router
from app.api.feedback.routes import router as feedback_router
from app.api.invitations.routes import router as invitations_router
from app.api.notifications.routes import router as notifications_router
from app.api.questions.routes import router as questions_router
from app.api.results.codewars_routes import router as codewars_router
from app.api.results.routes import router as results_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Dev convenience: create tables on startup. Use Alembic in production.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth router carries its own /auth prefix; mount under the API prefix.
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)

# Member 2 routers already declare their /api/* prefixes.
app.include_router(assessments_router)
app.include_router(questions_router)
app.include_router(invitations_router)
app.include_router(notifications_router)
app.include_router(results_router)
app.include_router(feedback_router)
app.include_router(codewars_router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)
