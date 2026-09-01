"""End-to-end backend tests covering BE-01 .. BE-24 (no frontend)."""
import pytest
from fastapi.testclient import TestClient


def _auth_headers(client: TestClient, email: str, password: str) -> dict:
    resp = client.post(
        "/api/auth/login", json={"email": email, "password": password}
    )
    assert resp.status_code == 200, resp.text
    token = resp.json()["token"]
    return {"Authorization": f"Bearer {token}"}


def _register(client, name, email, password, role):
    return client.post(
        "/api/auth/register",
        json={"name": name, "email": email, "password": password, "role": role},
    )


@pytest.fixture()
def recruiter(client: TestClient):
    resp = _register(client, "Recruiter One", "recruiter@example.com",
                     "secret123", "recruiter")
    assert resp.status_code == 201, resp.text
    headers = _auth_headers(client, "recruiter@example.com", "secret123")
    return headers


@pytest.fixture()
def interviewee(client: TestClient):
    resp = _register(client, "Candidate One", "candidate@example.com",
                     "secret123", "interviewee")
    assert resp.status_code == 201, resp.text
    headers = _auth_headers(client, "candidate@example.com", "secret123")
    return headers


def test_auth_register_login_duplicate(client: TestClient):
    r = _register(client, "A", "a@example.com", "secret123", "interviewee")
    assert r.status_code == 201
    assert "token" in r.json() and "id" in r.json() and "name" in r.json()
    # duplicate email
    r2 = _register(client, "A", "a@example.com", "secret123", "interviewee")
    assert r2.status_code == 409
    # invalid login
    bad = client.post("/api/auth/login",
                      json={"email": "a@example.com", "password": "wrong"})
    assert bad.status_code == 401
    # protected endpoint without token
    assert client.get("/api/auth/me").status_code == 401


def test_assessment_crud_and_publish(client: TestClient, recruiter, interviewee):
    # interviewee cannot create
    forbid = client.post(
        "/api/assessments",
        json={"title": "X", "time_limit_minutes": 30},
        headers=interviewee,
    )
    assert forbid.status_code == 403

    created = client.post(
        "/api/assessments",
        json={"title": "Screening", "description": "d", "time_limit_minutes": 45},
        headers=recruiter,
    )
    assert created.status_code == 201, created.text
    aid = created.json()["id"]

    # add an MCQ question
    q = client.post(
        "/api/questions",
        json={
            "assessment_id": aid,
            "question_text": "2+2?",
            "question_type": "multiple_choice",
            "points": 5,
            "options": [
                {"option_text": "3", "is_correct": False},
                {"option_text": "4", "is_correct": True},
            ],
        },
        headers=recruiter,
    )
    assert q.status_code == 201, q.text
    qid = q.json()["id"]

    # review + publish
    review = client.get(f"/api/assessments/{aid}/review", headers=recruiter)
    assert review.json()["ready_to_publish"] is True
    pub = client.post(f"/api/assessments/{aid}/publish", headers=recruiter)
    assert pub.status_code == 200 and pub.json()["status"] == "published"

    # subjective question validation
    bad = client.post(
        "/api/questions",
        json={"assessment_id": aid, "question_text": "Why?",
              "question_type": "subjective", "points": 5,
              "options": [{"option_text": "x", "is_correct": True}]},
        headers=recruiter,
    )
    assert bad.status_code == 422


def test_full_attempt_flow(client: TestClient, recruiter, interviewee):
    created = client.post(
        "/api/assessments",
        json={"title": "Flow", "time_limit_minutes": 60},
        headers=recruiter,
    )
    aid = created.json()["id"]
    q = client.post(
        "/api/questions",
        json={
            "assessment_id": aid, "question_text": "Pick one",
            "question_type": "multiple_choice", "points": 10,
            "options": [
                {"option_text": "A", "is_correct": False},
                {"option_text": "B", "is_correct": True},
            ],
        },
        headers=recruiter,
    )
    qid = q.json()["id"]
    opt_b = q.json()["choices"][1]["id"]
    client.post(f"/api/assessments/{aid}/publish", headers=recruiter)

    # invite + accept (enrollment)
    inv = client.post(
        "/api/invitations",
        json={"assessment_id": aid, "interviewee_id": 2},
        headers=recruiter,
    )
    assert inv.status_code == 201, inv.text
    iid = inv.json()["id"]
    accept = client.post(f"/api/invitations/{iid}/accept", headers=interviewee)
    assert accept.status_code == 200 and accept.json()["status"] == "accepted"

    # cannot start without accepting (use a second assessment)
    # start
    start = client.post(f"/api/assessments/{aid}/start", headers=interviewee)
    assert start.status_code == 200, start.text
    attempt_id = start.json()["id"]
    assert start.json()["remaining_seconds"] > 0

    # fetch questions (no correct flag leaked)
    qs = client.get(f"/api/assessments/{aid}/questions", headers=interviewee)
    assert qs.status_code == 200
    body = qs.json()
    assert body[0]["choices"][0]["choice_text"] == "A"
    assert "is_correct" not in body[0]["choices"][0]

    # save answer
    ans = client.post(
        f"/api/attempts/{attempt_id}/answers",
        json={"question_id": qid, "selected_option_id": opt_b},
        headers=interviewee,
    )
    assert ans.status_code == 200, ans.text

    # submit
    sub = client.post(f"/api/attempts/{attempt_id}/submit", headers=interviewee)
    assert sub.status_code == 200
    assert sub.json()["status"] == "submitted"
    assert float(sub.json()["score"]) == 10.0

    # results
    res = client.get(f"/api/assessments/{aid}/results", headers=recruiter)
    assert res.status_code == 200 and len(res.json()["results"]) == 1
    detail = client.get(f"/api/results/{attempt_id}", headers=interviewee)
    assert detail.status_code == 200 and detail.json()["score"] == 10.0


def test_invitations_notifications_feedback(client: TestClient, recruiter, interviewee):
    created = client.post(
        "/api/assessments",
        json={"title": "N", "time_limit_minutes": 60},
        headers=recruiter,
    )
    aid = created.json()["id"]
    client.post(
        "/api/invitations",
        json={"assessment_id": aid, "interviewee_id": 2},
        headers=recruiter,
    )
    notes = client.get("/api/notifications", headers=interviewee)
    assert notes.status_code == 200 and len(notes.json()) >= 1
    nid = notes.json()[0]["id"]
    mark = client.patch(f"/api/notifications/{nid}/read", headers=interviewee)
    assert mark.json()["is_read"] is True


def test_codewars_storage(client: TestClient, recruiter, monkeypatch):
    from app.services import codewars_service

    def fake_fetch(external_id):
        return {
            "id": external_id,
            "name": "Sample Kata",
            "description": "Do something",
            "rank": {"name": "4 kyu"},
            "category": "Algorithms",
            "url": "https://codewars.com/kata/x",
        }

    monkeypatch.setattr(codewars_service, "fetch_kata", fake_fetch)
    imported = client.post(
        "/api/codewars/import",
        json={"external_id": "abc123", "assessment_id": None},
        headers=recruiter,
    )
    assert imported.status_code == 200, imported.text
    assert imported.json()["name"] == "Sample Kata"
    listing = client.get("/api/codewars/challenges")
    assert listing.status_code == 200 and len(listing.json()) == 1
