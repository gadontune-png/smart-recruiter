import uuid

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)

RECRUITER_ID = "11111111-1111-1111-1111-111111111111"


def create_assessment():
    response = client.post(
        "/api/assessments",
        json={
            "title": "Test Assessment",
            "description": "Testing",
            "instructions": "Answer all questions",
            "duration": 60,
            "recruiter_id": RECRUITER_ID,
        },
    )

    assert response.status_code == 201
    return response.json()


def create_question(assessment_id):
    response = client.post(
        "/api/questions",
        json={
            "assessment_id": assessment_id,
            "question_text": "What is Python?",
            "question_type": "multiple_choice",
            "points": 5,
            "options": [
                "A programming language",
                "A database",
                "An operating system",
            ],
            "correct_answer": "A programming language",
        },
    )

    assert response.status_code == 201
    return response.json()


def test_assessment_crud():
    assessment = create_assessment()
    assessment_id = assessment["id"]

    # Retrieve
    response = client.get(f"/api/assessments/{assessment_id}")
    assert response.status_code == 200
    assert response.json()["id"] == assessment_id

    # Update
    response = client.put(
        f"/api/assessments/{assessment_id}",
        json={"title": "Updated Assessment", "duration": 90},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Assessment"
    assert response.json()["duration"] == 90

    # Delete
    response = client.delete(f"/api/assessments/{assessment_id}")
    assert response.status_code == 204

    # Confirm deletion
    response = client.get(f"/api/assessments/{assessment_id}")
    assert response.status_code == 404


def test_question_crud():
    assessment = create_assessment()
    assessment_id = assessment["id"]

    question = create_question(assessment_id)
    question_id = question["id"]

    # Retrieve
    response = client.get(f"/api/questions/{question_id}")
    assert response.status_code == 200

    # Update
    response = client.put(
        f"/api/questions/{question_id}",
        json={
            "question_text": "What language is used in this project?",
            "points": 10,
        },
    )
    assert response.status_code == 200
    assert response.json()["points"] == 10

    # Delete
    response = client.delete(f"/api/questions/{question_id}")
    assert response.status_code == 204

    # Confirm deletion
    response = client.get(f"/api/questions/{question_id}")
    assert response.status_code == 404


def test_mcq_validation():
    assessment = create_assessment()
    assessment_id = assessment["id"]

    response = client.post(
        "/api/questions",
        json={
            "assessment_id": assessment_id,
            "question_text": "Invalid MCQ",
            "question_type": "multiple_choice",
            "points": 5,
            "options": ["A", "B"],
            "correct_answer": "C",
        },
    )

    assert response.status_code == 422


def test_mcq_requires_options():
    assessment = create_assessment()

    response = client.post(
        "/api/questions",
        json={
            "assessment_id": assessment["id"],
            "question_text": "Invalid MCQ",
            "question_type": "multiple_choice",
            "points": 5,
            "correct_answer": "A",
        },
    )

    assert response.status_code == 422


def test_subjective_validation():
    assessment = create_assessment()

    response = client.post(
        "/api/questions",
        json={
            "assessment_id": assessment["id"],
            "question_text": "Explain Python.",
            "question_type": "subjective",
            "points": 5,
            "options": ["A", "B"],
        },
    )

    assert response.status_code == 422


def test_coding_validation():
    assessment = create_assessment()

    response = client.post(
        "/api/questions",
        json={
            "assessment_id": assessment["id"],
            "question_text": "Write a Python function.",
            "question_type": "coding",
            "points": 10,
        },
    )

    assert response.status_code == 422


def test_assessment_publishing():
    assessment = create_assessment()
    assessment_id = assessment["id"]

    # Cannot publish without questions
    response = client.post(
        f"/api/assessments/{assessment_id}/publish"
    )
    assert response.status_code == 400

    # Add a valid question
    create_question(assessment_id)

    # Review should say ready
    response = client.get(
        f"/api/assessments/{assessment_id}/review"
    )
    assert response.status_code == 200
    assert response.json()["ready_to_publish"] is True

    # Publish
    response = client.post(
        f"/api/assessments/{assessment_id}/publish"
    )
    assert response.status_code == 200
    assert response.json()["status"] == "published"


def test_published_assessment_cannot_be_modified():
    assessment = create_assessment()
    assessment_id = assessment["id"]

    create_question(assessment_id)

    response = client.post(
        f"/api/assessments/{assessment_id}/publish"
    )
    assert response.status_code == 200

    response = client.put(
        f"/api/assessments/{assessment_id}",
        json={"title": "Should Not Change"},
    )
    assert response.status_code == 400

    response = client.delete(
        f"/api/assessments/{assessment_id}"
    )
    assert response.status_code == 400
