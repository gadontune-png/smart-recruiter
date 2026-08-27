import uuid

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

ASSESSMENT_ID = str(uuid.uuid4())
INTERVIEWEE_ID = str(uuid.uuid4())
RECRUITER_ID = str(uuid.uuid4())


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_create_and_list_invitation():
    r = client.post(
        "/api/invitations",
        json={"assessment_id": ASSESSMENT_ID, "interviewee_id": INTERVIEWEE_ID},
    )
    assert r.status_code == 200
    assert r.json()["status"] == "pending"

    r2 = client.get("/api/invitations")
    assert r2.status_code == 200
    assert len(r2.json()) >= 1


def test_bulk_invitation():
    ids = [str(uuid.uuid4()), str(uuid.uuid4())]
    r = client.post(
        "/api/invitations/bulk",
        json={"assessment_id": ASSESSMENT_ID, "interviewee_ids": ids},
    )
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_accept_invitation():
    r = client.post(
        "/api/invitations",
        json={"assessment_id": ASSESSMENT_ID, "interviewee_id": INTERVIEWEE_ID},
    )
    invitation_id = r.json()["id"]

    r2 = client.post(f"/api/invitations/{invitation_id}/accept")
    assert r2.status_code == 200
    assert r2.json()["status"] == "accepted"


def test_accept_missing_invitation_404():
    r = client.post(f"/api/invitations/{uuid.uuid4()}/accept")
    assert r.status_code == 404


def test_create_result_and_sorted_listing():
    submission_id = str(uuid.uuid4())
    r = client.post(
        "/api/results",
        json={
            "submission_id": submission_id,
            "assessment_id": ASSESSMENT_ID,
            "interviewee_id": INTERVIEWEE_ID,
            "total_score": 92.0,
        },
    )
    assert r.status_code == 200

    r2 = client.get(f"/api/assessments/{ASSESSMENT_ID}/results")
    assert r2.status_code == 200
    scores = [row["total_score"] for row in r2.json()]
    assert scores == sorted(scores, reverse=True)


def test_release_grades():
    r = client.post(f"/api/assessments/{ASSESSMENT_ID}/release-grades")
    assert r.status_code == 200
    assert "released_count" in r.json()


def test_create_and_release_feedback():
    answer_id = str(uuid.uuid4())
    r = client.post(
        "/api/feedback",
        json={
            "answer_id": answer_id,
            "recruiter_id": RECRUITER_ID,
            "comment": "Solid answer.",
        },
    )
    assert r.status_code == 200
    feedback_id = r.json()["id"]
    assert r.json()["released"] is False

    r2 = client.patch(f"/api/feedback/{feedback_id}/release")
    assert r2.status_code == 200
    assert r2.json()["released"] is True

    r3 = client.get(f"/api/answers/{answer_id}/feedback")
    assert r3.status_code == 200
    assert len(r3.json()) == 1


def test_notifications_empty_for_unknown_user():
    r = client.get("/api/notifications", params={"user_id": str(uuid.uuid4())})
    assert r.status_code == 200
    assert r.json() == []


def test_mark_notification_read_missing_404():
    r = client.patch(f"/api/notifications/{uuid.uuid4()}/read")
    assert r.status_code == 404

