"""Tests for registration, login, JWT and role authorization."""
import uuid as _uuid

import pytest


def _unique_email(prefix: str = "t") -> str:
    return f"{prefix}-{_uuid.uuid4().hex[:8]}@example.com"


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "message": "Smart Recruiter API is running"}


def test_register_returns_token_and_user(client):
    resp = client.post(
        "/api/auth/register",
        json={
            "full_name": "Alice",
            "email": _unique_email("alice"),
            "password": "secret123",
            "role": "interviewee",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert "access_token" in body
    assert body["user"]["full_name"] == "Alice"
    assert body["user"]["role"] == "interviewee"
    assert "password" not in str(body)


def test_register_duplicate_email(client):
    email = _unique_email("dup")
    payload = {"full_name": "Bob", "email": email, "password": "secret123", "role": "interviewee"}
    r1 = client.post("/api/auth/register", json=payload)
    assert r1.status_code == 201
    r2 = client.post("/api/auth/register", json=payload)
    assert r2.status_code == 400
    assert "already" in r2.json()["detail"].lower()


def test_register_invalid_role(client):
    resp = client.post(
        "/api/auth/register",
        json={
            "full_name": "Bad",
            "email": _unique_email("bad"),
            "password": "secret123",
            "role": "admin",
        },
    )
    assert resp.status_code == 422


def test_login_success_and_jwt(client):
    email = _unique_email("carol")
    client.post(
        "/api/auth/register",
        json={"full_name": "Carol", "email": email, "password": "secret123", "role": "interviewee"},
    )
    resp = client.post("/api/auth/login", json={"email": email, "password": "secret123"})
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["user"]["email"] == email


def test_login_invalid_credentials(client):
    resp = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "wrongpass"})
    assert resp.status_code == 401
    assert "invalid" in resp.json()["detail"].lower()


def test_protected_route_requires_token(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_protected_route_with_token(client):
    email = _unique_email("dave")
    client.post(
        "/api/auth/register",
        json={"full_name": "Dave", "email": email, "password": "secret123", "role": "recruiter"},
    )
    login = client.post("/api/auth/login", json={"email": email, "password": "secret123"}).json()
    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {login['access_token']}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == email


def test_interviewee_cannot_create_assessment(client):
    """Interviewee role is forbidden from recruiter-only assessment creation."""
    email = _unique_email("eve")
    client.post(
        "/api/auth/register",
        json={"full_name": "Eve", "email": email, "password": "secret123", "role": "interviewee"},
    )
    login = client.post("/api/auth/login", json={"email": email, "password": "secret123"}).json()
    headers = {"Authorization": f"Bearer {login['access_token']}"}

    resp = client.post(
        "/api/assessments",
        json={"title": "Unauthorized", "time_limit_minutes": 30},
        headers=headers,
    )
    assert resp.status_code == 403


def test_recruiter_can_create_assessment(client):
    """Recruiter role can create assessments."""
    email = _unique_email("recruiter")
    client.post(
        "/api/auth/register",
        json={"full_name": "Recruiter", "email": email, "password": "secret123", "role": "recruiter"},
    )
    login = client.post("/api/auth/login", json={"email": email, "password": "secret123"}).json()
    headers = {"Authorization": f"Bearer {login['access_token']}"}

    resp = client.post(
        "/api/assessments",
        json={"title": "Allowed", "time_limit_minutes": 30},
        headers=headers,
    )
    assert resp.status_code == 201
