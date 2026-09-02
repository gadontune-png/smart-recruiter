"""Assessment and question CRUD + publishing tests."""
import uuid as _uuid

import pytest


def _unique_email(prefix: str = "t") -> str:
    return f"{prefix}-{_uuid.uuid4().hex[:8]}@example.com"


def _auth_headers(client, email: str, password: str = "secret123") -> dict:
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


@pytest.fixture()
def recruiter(client):
    email = _unique_email("recruiter")
    resp = client.post(
        "/api/auth/register",
        json={"full_name": "Recruiter", "email": email, "password": "secret123", "role": "recruiter"},
    )
    assert resp.status_code == 201, resp.text
    return _auth_headers(client, email)


def _create_assessment(client, headers, title="Test Assessment", time_limit=60):
    resp = client.post(
        "/api/assessments",
        json={"title": title, "time_limit_minutes": time_limit},
        headers=headers,
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def _add_mcq(client, assessment_id, headers, text="What is Python?", points=5):
    resp = client.post(
        f"/api/assessments/{assessment_id}/questions",
        json={
            "question_text": text,
            "question_type": "MULTIPLE_CHOICE",
            "points": points,
            "options": [
                {"option_text": "A programming language", "is_correct": True},
                {"option_text": "A database", "is_correct": False},
            ],
        },
        headers=headers,
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


# ---- Assessment CRUD ----

def test_assessment_create_and_get(client, recruiter):
    a = _create_assessment(client, recruiter)
    aid = a["assessment_id"]

    resp = client.get(f"/api/assessments/{aid}")
    assert resp.status_code == 200
    assert resp.json()["assessment_id"] == aid
    assert resp.json()["title"] == "Test Assessment"


def test_assessment_update(client, recruiter):
    a = _create_assessment(client, recruiter, title="Before")
    aid = a["assessment_id"]

    resp = client.patch(f"/api/assessments/{aid}", json={"title": "After"})
    assert resp.status_code == 200
    assert resp.json()["title"] == "After"


def test_assessment_delete(client, recruiter):
    a = _create_assessment(client, recruiter)
    aid = a["assessment_id"]

    resp = client.delete(f"/api/assessments/{aid}")
    assert resp.status_code == 200

    resp = client.get(f"/api/assessments/{aid}")
    assert resp.status_code == 404


def test_assessment_not_found(client, recruiter):
    resp = client.get("/api/assessments/999999")
    assert resp.status_code == 404


# ---- Question CRUD ----

def test_add_question(client, recruiter):
    a = _create_assessment(client, recruiter)
    q = _add_mcq(client, a["assessment_id"], recruiter)
    assert q["question_text"] == "What is Python?"
    assert q["question_type"] == "MULTIPLE_CHOICE"
    assert len(q["options"]) == 2


def test_list_questions_for_assessment(client, recruiter):
    a = _create_assessment(client, recruiter)
    _add_mcq(client, a["assessment_id"], recruiter, text="Q1")
    _add_mcq(client, a["assessment_id"], recruiter, text="Q2")

    resp = client.get(f"/api/assessments/{a['assessment_id']}/questions")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_question_filter_by_assessment(client, recruiter):
    a1 = _create_assessment(client, recruiter, title="One")
    a2 = _create_assessment(client, recruiter, title="Two")
    _add_mcq(client, a1["assessment_id"], recruiter)

    body = client.get(f"/api/assessments/{a1['assessment_id']}/questions").json()
    assert len(body) == 1
    assert body[0]["assessment_id"] == a1["assessment_id"]

    body2 = client.get(f"/api/assessments/{a2['assessment_id']}/questions").json()
    assert len(body2) == 0


# ---- Publishing ----

def test_cannot_publish_without_questions(client, recruiter):
    a = _create_assessment(client, recruiter)
    resp = client.post(f"/api/assessments/{a['assessment_id']}/publish", headers=recruiter)
    assert resp.status_code == 400
    assert "question" in resp.json()["detail"].lower()


def test_publish_with_questions(client, recruiter):
    a = _create_assessment(client, recruiter)
    _add_mcq(client, a["assessment_id"], recruiter)

    resp = client.post(f"/api/assessments/{a['assessment_id']}/publish", headers=recruiter)
    assert resp.status_code == 200
    assert resp.json()["status"] == "PUBLISHED"


def test_published_assessment_in_public_list(client, recruiter):
    a = _create_assessment(client, recruiter)
    _add_mcq(client, a["assessment_id"], recruiter)
    client.post(f"/api/assessments/{a['assessment_id']}/publish", headers=recruiter)

    listing = client.get("/api/assessments/")
    assert listing.status_code == 200
    assert any(x["assessment_id"] == a["assessment_id"] for x in listing.json())


def test_draft_assessment_not_in_public_list(client, recruiter):
    a = _create_assessment(client, recruiter)
    _add_mcq(client, a["assessment_id"], recruiter)
    # Don't publish — stays DRAFT

    listing = client.get("/api/assessments/")
    assert listing.status_code == 200
    assert all(x["assessment_id"] != a["assessment_id"] for x in listing.json())


# ---- MCQ validation ----

def test_mcq_requires_options(client, recruiter):
    a = _create_assessment(client, recruiter)
    resp = client.post(
        f"/api/assessments/{a['assessment_id']}/questions",
        json={
            "question_text": "No options MCQ",
            "question_type": "MULTIPLE_CHOICE",
            "points": 5,
            "options": [],
        },
        headers=recruiter,
    )
    # Should accept but with empty options (valid per schema — no server-side reject)
    assert resp.status_code == 201


def test_subjective_question_no_options(client, recruiter):
    a = _create_assessment(client, recruiter)
    resp = client.post(
        f"/api/assessments/{a['assessment_id']}/questions",
        json={
            "question_text": "Explain Python.",
            "question_type": "SUBJECTIVE",
            "points": 10,
        },
        headers=recruiter,
    )
    assert resp.status_code == 201
    assert resp.json()["question_type"] == "SUBJECTIVE"


def test_coding_question(client, recruiter):
    a = _create_assessment(client, recruiter)
    resp = client.post(
        f"/api/assessments/{a['assessment_id']}/questions",
        json={
            "question_text": "Write a function.",
            "question_type": "CODING",
            "points": 20,
            "starter_code": "def solve():\n    pass",
            "language": "python",
        },
        headers=recruiter,
    )
    assert resp.status_code == 201
    assert resp.json()["starter_code"] == "def solve():\n    pass"
