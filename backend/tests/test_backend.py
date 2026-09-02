"""End-to-end backend tests covering the current API surface."""
import pytest
from fastapi.testclient import TestClient

# To avoid coupling tests to real blobs, use unique emails per run.
import uuid as _uuid


def _unique_email(prefix: str) -> str:
    return f"{prefix}-{_uuid.uuid4().hex[:8]}@example.com"


def _auth_headers(client: TestClient, email: str, password: str) -> dict:
    resp = client.post(
        "/api/auth/login", json={"email": email, "password": password}
    )
    assert resp.status_code == 200, resp.text
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _register(client, full_name, email, password, role):
    return client.post(
        "/api/auth/register",
        json={"full_name": full_name, "email": email, "password": password, "role": role},
    )


@pytest.fixture()
def recruiter(client: TestClient):
    email = _unique_email("recruiter")
    resp = _register(client, "Recruiter One", email, "secret123", "recruiter")
    assert resp.status_code == 201, resp.text
    return _auth_headers(client, email, "secret123")


@pytest.fixture()
def interviewee(client: TestClient):
    email = _unique_email("candidate")
    resp = _register(client, "Candidate One", email, "secret123", "interviewee")
    assert resp.status_code == 201, resp.text
    return _auth_headers(client, email, "secret123")


def test_auth_register_login_duplicate(client: TestClient):
    email = _unique_email("a")
    r = _register(client, "A", email, "secret123", "interviewee")
    assert r.status_code == 201
    body = r.json()
    assert "access_token" in body and "user" in body
    assert body["user"]["full_name"] == "A"
    # duplicate email
    r2 = _register(client, "A", email, "secret123", "interviewee")
    assert r2.status_code == 400
    # invalid login
    bad = client.post("/api/auth/login",
                      json={"email": email, "password": "wrong"})
    assert bad.status_code == 401
    # protected endpoint without token
    assert client.get("/api/auth/me").status_code == 401


def test_assessment_crud_and_publish(client: TestClient, recruiter):
    created = client.post(
        "/api/assessments",
        json={"title": "Screening", "description": "d", "time_limit_minutes": 45},
        headers=recruiter,
    )
    assert created.status_code == 201, created.text
    aid = created.json()["assessment_id"]

    # add an MCQ question
    q = client.post(
        f"/api/assessments/{aid}/questions",
        json={
            "question_text": "2+2?",
            "question_type": "MULTIPLE_CHOICE",
            "points": 5,
            "options": [
                {"option_text": "3", "is_correct": False},
                {"option_text": "4", "is_correct": True},
            ],
        },
        headers=recruiter,
    )
    assert q.status_code == 201, q.text
    assert len(q.json()["options"]) == 2

    # publish
    pub = client.post(f"/api/assessments/{aid}/publish", headers=recruiter)
    assert pub.status_code == 200 and pub.json()["status"] == "PUBLISHED"

    # published assessment visible in list
    listing = client.get("/api/assessments/")
    assert listing.status_code == 200
    assert any(a["assessment_id"] == aid for a in listing.json())


def test_question_filter_by_assessment(client: TestClient, recruiter):
    a1 = client.post(
        "/api/assessments", json={"title": "One", "time_limit_minutes": 30}, headers=recruiter
    ).json()["assessment_id"]
    a2 = client.post(
        "/api/assessments", json={"title": "Two", "time_limit_minutes": 30}, headers=recruiter
    ).json()["assessment_id"]
    client.post(
        f"/api/assessments/{a1}/questions",
        json={"question_text": "Only in one", "question_type": "SUBJECTIVE", "points": 5},
        headers=recruiter,
    )
    body = client.get(f"/api/questions/?assessment_id={a1}", headers=recruiter).json()
    assert len(body) == 1 and body[0]["assessment_id"] == a1
    assert (
        len(client.get(f"/api/questions/?assessment_id={a2}", headers=recruiter).json())
        == 0
    )


def test_invitations_and_notifications(client: TestClient, recruiter, interviewee):
    target_email = _unique_email("target")
    resp = _register(client, "Candidate Target", target_email, "secret123", "interviewee")
    target_id = resp.json()["user"]["user_id"]
    target_headers = {
        "Authorization": f"Bearer {client.post('/api/auth/login', json={'email': target_email, 'password': 'secret123'}).json()['access_token']}"
    }

    aid = client.post(
        "/api/assessments", json={"title": "N", "time_limit_minutes": 60}, headers=recruiter
    ).json()["assessment_id"]

    inv = client.post(
        "/api/invitations",
        json={"assessment_id": aid, "interviewee_id": target_id},
        headers=recruiter,
    )
    assert inv.status_code == 200, inv.text
    iid = inv.json()["invitation_id"]
    assert inv.json()["title"] == "N"

    accept = client.post(f"/api/invitations/{iid}/accept", headers=target_headers)
    assert accept.status_code == 200 and accept.json()["status"] == "ACCEPTED"

    notes = client.get("/api/notifications", headers=target_headers)
    assert notes.status_code == 200
    if notes.json():
        nid = notes.json()[0]["notification_id"]
        mark = client.patch(f"/api/notifications/{nid}/read", headers=target_headers)
        assert mark.status_code == 200 and mark.json()["is_read"] is True


def test_code_execution(client: TestClient, interviewee):
    r = client.post("/api/submissions/code/run",
                    json={"code": "print(1 + 1)", "language": "python"},
                    headers=interviewee)
    assert r.status_code == 200
    body = r.json()
    assert body["status"] in ("ok", "partial")
    assert "2" in body["stdout"]


def test_results_and_release(client: TestClient, recruiter):
    aid = client.post(
        "/api/assessments", json={"title": "R", "time_limit_minutes": 60}, headers=recruiter
    ).json()["assessment_id"]
    empty = client.get(f"/api/assessments/{aid}/results", headers=recruiter)
    assert empty.status_code == 200 and empty.json() == []
    release = client.post(f"/api/assessments/{aid}/release-grades", headers=recruiter)
    assert release.status_code == 200 and release.json()["released_count"] == 0


def test_attempt_flow_creates_result(client: TestClient, recruiter, interviewee):
    target = _register(client, "Candidate Flow", _unique_email("flow"), "secret123", "interviewee")
    target_id = target.json()["user"]["user_id"]
    target_headers = _auth_headers(client, target.json()["user"]["email"], "secret123")

    aid = client.post(
        "/api/assessments", json={"title": "Flow", "time_limit_minutes": 60}, headers=recruiter
    ).json()["assessment_id"]
    q = client.post(
        f"/api/assessments/{aid}/questions",
        json={
            "question_text": "Pick 4",
            "question_type": "MULTIPLE_CHOICE",
            "points": 5,
            "options": [
                {"option_text": "3", "is_correct": False},
                {"option_text": "4", "is_correct": True},
            ],
        },
        headers=recruiter,
    ).json()
    correct_option = next(o["option_id"] for o in q["options"] if o["is_correct"])
    client.post(f"/api/assessments/{aid}/publish", headers=recruiter)

    iid = client.post(
        "/api/invitations", json={"assessment_id": aid, "interviewee_id": target_id}, headers=recruiter
    ).json()["invitation_id"]
    client.post(f"/api/invitations/{iid}/accept", headers=target_headers)

    start = client.post(f"/api/assessments/{aid}/start", headers=target_headers)
    assert start.status_code == 200, start.text
    attempt_id = start.json()["id"]
    assert start.json()["status"] == "in_progress"

    saved = client.post(
        f"/api/attempts/{attempt_id}/answers",
        json={"question_id": q["question_id"], "selected_option_id": correct_option},
        headers=target_headers,
    )
    assert saved.status_code == 200

    sub = client.post(f"/api/attempts/{attempt_id}/submit", headers=target_headers)
    assert sub.status_code == 200, sub.text
    assert sub.json()["score"] == 5.0

    results = client.get(f"/api/assessments/{aid}/results", headers=recruiter).json()
    assert len(results) == 1
    assert results[0]["total_score"] == 5.0
    assert results[0]["interviewee_name"] == "Candidate Flow"
    assert results[0]["grade_released"] is False