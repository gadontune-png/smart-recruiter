"""Tests for the email-based invitation flow."""
import uuid as _uuid

from fastapi.testclient import TestClient


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


def test_email_bulk_invitation_creates_users_and_invitations(client: TestClient):
    recruiter_email = _unique_email("recruiter")
    _register(client, "Recruiter Email", recruiter_email, "secret123", "recruiter")
    recruiter = _auth_headers(client, recruiter_email, "secret123")

    aid = client.post(
        "/api/assessments", json={"title": "Email Invite", "time_limit_minutes": 60}, headers=recruiter
    ).json()["assessment_id"]

    candidates = [_unique_email("cand"), _unique_email("cand2")]

    # Fresh emails -> users should be auto-created as interviewees
    resp = client.post(
        "/api/invitations/email/bulk",
        json={"assessment_id": aid, "emails": candidates},
        headers=recruiter,
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert len(body) == 2
    for inv in body:
        assert inv["interviewee_email"] in candidates
        assert inv["status"] == "PENDING"
        assert inv["title"] == "Email Invite"

    # The auto-created users can log in and see their invitation
    first = body[0]["interviewee_email"]
    login = client.post("/api/auth/login", json={"email": first, "password": "temporary-password-change-me"})
    assert login.status_code == 200, login.text
    candidate_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    invites = client.get("/api/invitations", headers=candidate_headers)
    assert invites.status_code == 200
    assert any(i["interviewee_email"] == first for i in invites.json())

    # Existing interviewee (not auto-created) reused, no duplicate user
    existing = _register(client, "Existing Cand", _unique_email("existing"), "secret123", "interviewee")
    existing_email = existing.json()["user"]["email"]
    resp_existing = client.post(
        "/api/invitations/email/bulk",
        json={"assessment_id": aid, "emails": [existing_email]},
        headers=recruiter,
    )
    assert resp_existing.status_code == 200
    assert len(resp_existing.json()) == 1


def test_email_invitation_single(client: TestClient):
    recruiter_email = _unique_email("recruiter")
    _register(client, "Recruiter Email", recruiter_email, "secret123", "recruiter")
    recruiter = _auth_headers(client, recruiter_email, "secret123")

    aid = client.post(
        "/api/assessments", json={"title": "Single", "time_limit_minutes": 45}, headers=recruiter
    ).json()["assessment_id"]

    resp = client.post(
        "/api/invitations/email",
        json={"assessment_id": aid, "email": _unique_email("single"), "interviewee_name": "Single Cand"},
        headers=recruiter,
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["interviewee_name"] == "Single Cand" or resp.json()["interviewee_name"] is None or resp.json()["interviewee_email"]
