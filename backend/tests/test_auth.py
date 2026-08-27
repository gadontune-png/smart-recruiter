"""Tests for registration, login, JWT and role authorization (BE-06)."""
import pytest

from app.models.user import INTERVIEWEE, RECRUITER


@pytest.fixture()
def recruiter_token(client):
    client.post(
        "/api/auth/register",
        json={
            "name": "Recruiter Demo",
            "email": "recruiter@demo.com",
            "password": "secret123",
            "role": RECRUITER,
        },
    )
    # re-login to obtain a fresh token
    resp = client.post(
        "/api/auth/login",
        json={"email": "recruiter@demo.com", "password": "secret123"},
    )
    return resp.json()["token"]


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_register_returns_token(client):
    resp = client.post(
        "/api/auth/register",
        json={
            "name": "Alice",
            "email": "alice@example.com",
            "password": "secret123",
            "role": INTERVIEWEE,
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["token"]
    assert body["email"] == "alice@example.com"
    assert body["role"] == INTERVIEWEE
    assert "password" not in body


def test_register_duplicate_email(client):
    payload = {
        "name": "Bob",
        "email": "dup@example.com",
        "password": "secret123",
    }
    assert client.post("/api/auth/register", json=payload).status_code == 201
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 409
    assert "already exists" in resp.json()["detail"]


def test_register_invalid_role(client):
    resp = client.post(
        "/api/auth/register",
        json={
            "name": "Bad",
            "email": "bad@example.com",
            "password": "secret123",
            "role": "admin",
        },
    )
    assert resp.status_code == 422


def test_login_success_and_jwt(client):
    client.post(
        "/api/auth/register",
        json={
            "name": "Carol",
            "email": "carol@example.com",
            "password": "secret123",
        },
    )
    resp = client.post(
        "/api/auth/login",
        json={"email": "carol@example.com", "password": "secret123"},
    )
    assert resp.status_code == 200
    assert resp.json()["token"]


def test_login_invalid_credentials(client):
    resp = client.post(
        "/api/auth/login",
        json={"email": "nobody@example.com", "password": "wrongpass"},
    )
    assert resp.status_code == 401
    assert "Invalid email or password" in resp.json()["detail"]


def test_protected_route_requires_token(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_protected_route_with_token(client):
    client.post(
        "/api/auth/register",
        json={
            "name": "Dave",
            "email": "dave@example.com",
            "password": "secret123",
            "role": RECRUITER,
        },
    )
    login = client.post(
        "/api/auth/login",
        json={"email": "dave@example.com", "password": "secret123"},
    ).json()
    resp = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {login['token']}"},
    )
    assert resp.status_code == 200
    assert resp.json()["email"] == "dave@example.com"


def test_role_restriction(client, recruiter_token):
    # Recruiter can access recruiter-only route.
    ok = client.get(
        "/api/auth/recruiter-only",
        headers={"Authorization": f"Bearer {recruiter_token}"},
    )
    assert ok.status_code == 200

    # Interviewee is forbidden from recruiter-only route.
    client.post(
        "/api/auth/register",
        json={
            "name": "Eve",
            "email": "eve@example.com",
            "password": "secret123",
            "role": INTERVIEWEE,
        },
    )
    interviewee_token = client.post(
        "/api/auth/login",
        json={"email": "eve@example.com", "password": "secret123"},
    ).json()["token"]

    forbidden = client.get(
        "/api/auth/recruiter-only",
        headers={"Authorization": f"Bearer {interviewee_token}"},
    )
    assert forbidden.status_code == 403
