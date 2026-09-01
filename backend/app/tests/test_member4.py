import uuid as _uuid

import pytest
from fastapi.testclient import TestClient


def _unique_email(prefix: str) -> str:
    return f"{prefix}-{_uuid.uuid4().hex[:8]}@example.com"


def _register(client, full_name, email, password, role):
    return client.post(
        "/api/auth/register",
        json={"full_name": full_name, "email": email, "password": password, "role": role},
    )


def _auth_headers(client: TestClient, email: str, password: str) -> dict:
    token = client.post(
        "/api/auth/login", json={"email": email, "password": password}
    ).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _make_recruiter(client: TestClient) -> dict:
    email = _unique_email("recruiter")
    _register(client, "Recruiter", email, "secret123", "recruiter")
    return _auth_headers(client, email, "secret123")


def _make_interviewee(client: TestClient):
    email = _unique_email("candidate")
    resp = _register(client, "Candidate", email, "secret123", "interviewee")
    return resp.json()["user"]["user_id"]


def test_health(client: TestClient):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_create_and_list_invitation(client: TestClient):
    recruiter = _make_recruiter(client)
    interviewee_id = _make_interviewee(client)
    aid = client.post(
        "/api/assessments", json={"title": "Inv", "time_limit_minutes": 30}, headers=recruiter
    ).json()["assessment_id"]

    r = client.post(
        "/api/invitations",
        json={"assessment_id": aid, "interviewee_id": interviewee_id},
        headers=recruiter,
    )
    assert r.status_code == 200
    assert r.json()["status"] == "PENDING"
    assert r.json()["title"] == "Inv"

    r2 = client.get("/api/invitations")
    assert r2.status_code == 200
    assert len(r2.json()) >= 1


def test_bulk_invitation(client: TestClient):
    recruiter = _make_recruiter(client)
    id1 = _make_interviewee(client)
    id2 = _make_interviewee(client)
    aid = client.post(
        "/api/assessments", json={"title": "Bulk", "time_limit_minutes": 30}, headers=recruiter
    ).json()["assessment_id"]

    r = client.post(
        "/api/invitations/bulk",
        json={"assessment_id": aid, "interviewee_ids": [id1, id2]},
        headers=recruiter,
    )
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_accept_invitation(client: TestClient):
    recruiter = _make_recruiter(client)
    interviewee_id = _make_interviewee(client)
    aid = client.post(
        "/api/assessments", json={"title": "Acc", "time_limit_minutes": 30}, headers=recruiter
    ).json()["assessment_id"]

    r = client.post(
        "/api/invitations",
        json={"assessment_id": aid, "interviewee_id": interviewee_id},
        headers=recruiter,
    )
    invitation_id = r.json()["invitation_id"]

    r2 = client.post(f"/api/invitations/{invitation_id}/accept")
    assert r2.status_code == 200
    assert r2.json()["status"] == "ACCEPTED"


def test_accept_missing_invitation_404(client: TestClient):
    r = client.post("/api/invitations/999999/accept")
    assert r.status_code == 404


def test_create_result_and_sorted_listing(client: TestClient):
    recruiter = _make_recruiter(client)
    interviewee_id = _make_interviewee(client)
    aid = client.post(
        "/api/assessments", json={"title": "Res", "time_limit_minutes": 30}, headers=recruiter
    ).json()["assessment_id"]

    r = client.post(
        "/api/results",
        json={
            "submission_id": 1,
            "assessment_id": aid,
            "interviewee_id": interviewee_id,
            "total_score": 92.0,
        },
    )
    assert r.status_code == 200

    r2 = client.get(f"/api/assessments/{aid}/results")
    assert r2.status_code == 200
    scores = [row["total_score"] for row in r2.json()]
    assert scores == sorted(scores, reverse=True)


def test_release_grades(client: TestClient):
    recruiter = _make_recruiter(client)
    aid = client.post(
        "/api/assessments", json={"title": "Grade", "time_limit_minutes": 30}, headers=recruiter
    ).json()["assessment_id"]

    r = client.post(f"/api/assessments/{aid}/release-grades", headers=recruiter)
    assert r.status_code == 200
    assert "released_count" in r.json()


def test_create_and_release_feedback(client: TestClient):
    recruiter = _make_recruiter(client)
    answer_id = 1
    r = client.post(
        "/api/feedback",
        json={
            "answer_id": answer_id,
            "recruiter_id": 1,
            "comment": "Solid answer.",
        },
        headers=recruiter,
    )
    assert r.status_code == 200
    assert r.json()["feedback_id"] is not None

    r3 = client.get(f"/api/answers/{answer_id}/feedback")
    assert r3.status_code == 200
    assert len(r3.json()) == 1


def test_notifications_empty_for_unknown_user(client: TestClient):
    r = client.get("/api/notifications", params={"user_id": 999999})
    assert r.status_code == 200
    assert r.json() == []


def test_mark_notification_read_missing_404(client: TestClient):
    r = client.patch("/api/notifications/999999/read")
    assert r.status_code == 404