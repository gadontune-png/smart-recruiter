#!/usr/bin/env python3
"""Interactive demo of the Smart Recruiter backend.

Run the server first:
    uvicorn app.main:app --reload --port 5000

Then:  python scripts/demo.py
"""
import requests

BASE = "http://localhost:5000"
API = "/api"


def banner(title):
    print(f"\n{'='*60}\n {title}\n{'='*60}")


def register(email, password, role, name):
    r = requests.post(f"{BASE}{API}/auth/register", json={
        "name": name, "email": email, "password": password, "role": role
    })
    print(f"[REGISTER {email} ({role})] -> {r.status_code}")
    if r.status_code == 409:
        print(f"  (duplicate — logging in instead)")
        return login(email, password)
    if r.status_code != 201:
        print(f"  ERROR: {r.text}")
        return None
    return r.json()["token"]


def login(email, password):
    r = requests.post(f"{BASE}{API}/auth/login", json={
        "email": email, "password": password
    })
    print(f"[LOGIN {email}] -> {r.status_code}")
    if r.status_code != 200:
        print(f"  ERROR: {r.text}")
        return None
    data = r.json()
    print(f"  token={data['token'][:30]}...  role={data['role']}  id={data['id']}")
    return data["token"]


def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---- 1. Auth & roles ----
banner("BE-01..06  Authentication & Authorization")

print("\n-- Register a recruiter")
recruiter_token = register("recruiter@demo.com", "secret123", "recruiter", "Recruiter Demo")

print("\n-- Register an interviewee")
candidate_token = register("candidate@demo.com", "secret123", "interviewee", "Candidate Demo")

print("\n-- Login (duplicate register -> auto-login)")
token = register("recruiter@demo.com", "secret123", "recruiter", "Recruiter Demo")

print("\n-- /auth/me (protected)")
r = requests.get(f"{BASE}{API}/auth/me", headers=auth(recruiter_token))
print(f"  -> {r.status_code}  {r.json()}")

print("\n-- /auth/recruiter-only (recruiter access)")
r = requests.get(f"{BASE}{API}/auth/recruiter-only", headers=auth(recruiter_token))
print(f"  -> {r.status_code}  {r.json()['email']}")

print("\n-- /auth/recruiter-only (interviewee -> 403)")
r = requests.get(f"{BASE}{API}/auth/recruiter-only", headers=auth(candidate_token))
print(f"  -> {r.status_code}  {r.json().get('detail', '')}")

print("\n-- /auth/me without token (401)")
r = requests.get(f"{BASE}{API}/auth/me")
print(f"  -> {r.status_code}")


# ---- 2. Assessments & Questions ----
banner("BE-07..11  Assessments & Questions")

print("\n-- Recruiter creates an assessment")
r = requests.post(f"{BASE}{API}/assessments", json={
    "title": "Python Screening",
    "description": "Basic Python knowledge check",
    "time_limit_minutes": 60,
    "start_date": "2025-01-01T00:00:00Z",
    "end_date": "2025-12-31T23:59:59Z",
}, headers=auth(recruiter_token))
print(f"  -> {r.status_code}  {r.json()}")
assessment_id = r.json()["id"]

print("\n-- Recruiter adds an MCQ question")
r = requests.post(f"{BASE}{API}/questions", json={
    "assessment_id": assessment_id,
    "question_text": "What is 2 + 2?",
    "question_type": "multiple_choice",
    "points": 5,
    "order_number": 1,
    "options": [
        {"option_text": "3", "is_correct": False},
        {"option_text": "4", "is_correct": True},
        {"option_text": "5", "is_correct": False},
    ],
}, headers=auth(recruiter_token))
print(f"  -> {r.status_code}  {r.json()}")
question_id = r.json()["id"]
option_id = r.json()["choices"][1]["id"]  # the correct option

print("\n-- Recruiter rejects subjective question with options (422)")
r = requests.post(f"{BASE}{API}/questions", json={
    "assessment_id": assessment_id,
    "question_text": "Explain Python GIL",
    "question_type": "subjective",
    "points": 10,
    "order_number": 2,
    "options": [{"option_text": "x", "is_correct": True}],
}, headers=auth(recruiter_token))
print(f"  -> {r.status_code}  {r.json().get('detail', r.text)}")

print("\n-- Recruiter adds a subjective question")
r = requests.post(f"{BASE}{API}/questions", json={
    "assessment_id": assessment_id,
    "question_text": "Explain the Python GIL",
    "question_type": "subjective",
    "points": 10,
    "order_number": 2,
}, headers=auth(recruiter_token))
print(f"  -> {r.status_code}  {r.json()}")

print("\n-- Review assessment (ready to publish?)")
r = requests.get(f"{BASE}{API}/assessments/{assessment_id}/review", headers=auth(recruiter_token))
print(f"  -> {r.status_code}  {r.json()}")

print("\n-- Publish assessment")
r = requests.post(f"{BASE}{API}/assessments/{assessment_id}/publish", headers=auth(recruiter_token))
print(f"  -> {r.status_code}  {r.json()}")


# ---- 3. Invitations ----
banner("BE-19  Invitations")

print("\n-- Recruiter invites the candidate")
r = requests.post(f"{BASE}{API}/invitations", json={
    "assessment_id": assessment_id,
    "interviewee_id": 2,  # candidate user_id
}, headers=auth(recruiter_token))
print(f"  -> {r.status_code}  {r.json()}")
invitation_id = r.json()["id"]

print("\n-- Bulk invite")
r = requests.post(f"{BASE}{API}/invitations/bulk", json={
    "assessment_id": assessment_id,
    "interviewee_ids": [2],
}, headers=auth(recruiter_token))
print(f"  -> {r.status_code}")

print("\n-- Candidate views notifications")
r = requests.get(f"{BASE}{API}/notifications", headers=auth(candidate_token))
print(f"  -> {r.status_code}  {len(r.json())} notification(s)")
if r.json():
    notification_id = r.json()[0]["id"]
    print("\n-- Candidate marks notification as read")
    r2 = requests.patch(f"{BASE}{API}/notifications/{notification_id}/read", headers=auth(candidate_token))
    print(f"  -> {r2.status_code}  is_read={r2.json()['is_read']}")


# ---- 4. Assessment Attempt ----
banner("BE-13..18  Taking an Assessment")

print("\n-- Candidate accepts invitation")
r = requests.post(f"{BASE}{API}/invitations/{invitation_id}/accept", headers=auth(candidate_token))
print(f"  -> {r.status_code}  status={r.json()['status']}")

print("\n-- Candidate starts the assessment")
r = requests.post(f"{BASE}{API}/assessments/{assessment_id}/start", headers=auth(candidate_token))
print(f"  -> {r.status_code}  {r.json()}")
attempt_id = r.json()["id"]
print(f"  remaining_seconds={r.json().get('remaining_seconds')}")

print("\n-- Candidate fetches questions (no answer key leaked)")
r = requests.get(f"{BASE}{API}/assessments/{assessment_id}/questions", headers=auth(candidate_token))
print(f"  -> {r.status_code}")
for q in r.json():
    print(f"     Q{q['id']}: {q['prompt']}  type={q['type']}")
    if q.get("choices"):
        for c in q["choices"]:
            has_correct = "is_correct" in c
            print(f"        - {c['choice_text']}  leaks_key={has_correct}")

print("\n-- Candidate saves MCQ answer (correct)")
r = requests.post(f"{BASE}{API}/attempts/{attempt_id}/answers", json={
    "question_id": question_id,
    "selected_option_id": option_id,
}, headers=auth(candidate_token))
print(f"  -> {r.status_code}")

print("\n-- Candidate saves subjective answer")
# Need the second question id (subjective)
r2 = requests.get(f"{BASE}{API}/assessments/{assessment_id}/questions", headers=auth(candidate_token))
subj_qid = [q["id"] for q in r2.json() if q["type"] == "subjective"][0]
r3 = requests.post(f"{BASE}{API}/attempts/{attempt_id}/answers", json={
    "question_id": subj_qid,
    "answer_text": "The GIL prevents multiple threads from executing Python bytecodes simultaneously.",
}, headers=auth(candidate_token))
print(f"  -> {r3.status_code}")

print("\n-- Candidate retrieves saved answers")
r = requests.get(f"{BASE}{API}/attempts/{attempt_id}/answers", headers=auth(candidate_token))
print(f"  -> {r.status_code}  answers={len(r.json())}")

print("\n-- Candidate submits the assessment")
r = requests.post(f"{BASE}{API}/attempts/{attempt_id}/submit", headers=auth(candidate_token))
print(f"  -> {r.status_code}  {r.json()}")
print(f"  score={r.json().get('score')}")


# ---- 5. Results ----
banner("BE-21  Results & Grading")

print("\n-- Recruiter views all results for the assessment")
r = requests.get(f"{BASE}{API}/assessments/{assessment_id}/results", headers=auth(recruiter_token))
print(f"  -> {r.status_code}  {r.json()}")

print("\n-- Candidate views own result")
r = requests.get(f"{BASE}{API}/results/{attempt_id}", headers=auth(candidate_token))
print(f"  -> {r.status_code}  {r.json()}")


# ---- 6. Feedback ----
banner("BE-22  Feedback (manual grading for subjective answers)")

print("\n-- Recruiter leaves feedback on the subjective answer")
# Fetch answers with candidate token (interviewee-owned endpoint)
r = requests.get(f"{BASE}{API}/attempts/{attempt_id}/answers", headers=auth(candidate_token))
answers_data = r.json()
subjective_answer_id = None
if isinstance(answers_data, list):
    for a in answers_data:
        if a.get("answer_text"):
            subjective_answer_id = a["id"]
            break
    print(f"  Found {len(answers_data)} answers, subjective answer_id={subjective_answer_id}")
else:
    print(f"  Unexpected response: {answers_data}")

r = requests.post(f"{BASE}{API}/feedback", json={
    "answer_id": subjective_answer_id,
    "comment": "Good understanding, but could mention thread-local storage.",
    "score": 8.0,
}, headers=auth(recruiter_token))
print(f"  -> {r.status_code}  {r.json()}")

print("\n-- Candidate views feedback")
r = requests.get(f"{BASE}{API}/feedback?answer_id={subjective_answer_id}", headers=auth(candidate_token))
print(f"  -> {r.status_code}  {r.json()}")


# ---- 7. Codewars ----
banner("BE-23  Codewars Integration")

print("\n-- Recruiter imports a Codewars kata (mocked in tests)")
print("  (In production, this fetches from codewars.com API)")
print("  Endpoint: POST /api/codewars/import")
print("  Endpoint: GET  /api/codewars/challenges")

banner("Demo Complete")
print(f"\nServer running at {BASE}")
print(f"Interactive docs at {BASE}/docs")
print(f"ReDoc docs at     {BASE}/redoc")
