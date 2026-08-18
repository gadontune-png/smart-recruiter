# Smart Recruiter — DebugMasters

> A technical assessment and automated interview platform for evaluating software development candidates.

Smart Recruiter is a web-based technical assessment platform inspired by platforms such as Coderbyte. It allows recruiters to create and manage technical assessments while giving interviewees a structured environment to complete coding challenges, multiple-choice questions, subjective questions, and whiteboard exercises.

The platform is being developed by **DebugMasters** as a full-stack application.

---

## Project Overview

### Problem

Traditional technical interviews can be time-consuming and difficult to standardize. Interviewers need to manually prepare questions, monitor candidates, evaluate answers, and manage feedback.

Smart Recruiter aims to automate and organize this process through a centralized assessment platform.

### Goal

Build a platform where:

- Recruiters can create and publish technical assessments.
- Interviewees can receive and accept assessment invitations.
- Candidates can complete assessments within a defined time limit.
- Coding and whiteboard challenges can be submitted digitally.
- Recruiters can review answers and provide feedback.
- Results and performance statistics can be generated and reviewed.
- Interviewees can access feedback after grades are released.

---

# Core User Types

The platform has two primary user types.

## Recruiter

Recruiters can:

- Create assessments.
- Add multiple-choice questions.
- Add subjective/free-text questions.
- Add coding challenges/Katas.
- Review and publish assessments.
- Invite interviewees individually or in bulk.
- Set assessment time limits.
- View submitted assessments.
- Sort interviewees by scores.
- View performance statistics.
- Review individual answers.
- Leave feedback on answers.
- Release grades.

## Interviewee

Interviewees can:

- Log in to the platform.
- View available assessments.
- Accept assessment invitations.
- Receive assessment notifications.
- View assessment schedules.
- Take trial assessments.
- Take actual assessments.
- See a live countdown timer.
- Submit BDD.
- Submit pseudocode.
- Submit code.
- Complete whiteboard/coding challenges.
- View released grades and mentor feedback.

---

# Technology Stack

## Frontend

- React.js
- JavaScript
- Redux Toolkit
- React Router
- Vite
- ESLint

## Backend

- Python
- Flask or FastAPI

## Database

- PostgreSQL

## Testing

- Jest
- Python unit testing / Minittest

## External API

- Codewars API

The Codewars API will be consumed to provide toy programming problems that can be used for whiteboarding challenges and sample/trial assessments.

---

