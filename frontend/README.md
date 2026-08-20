# Smart Recruiter — Frontend

> React + Redux Toolkit frontend for the Smart Recruiter technical assessment platform.

## Stack

- React 19 + Vite
- Redux Toolkit (state) + React Redux
- React Router (routing)
- ESLint (JS, JSX, React Hooks, React Refresh)

## Getting started

```bash
npm install
npm run dev        # start dev server (http://localhost:5173)
npm run build      # production build
npm run preview    # preview production build
npm run lint       # ESLint
```

### Demo accounts (mock mode, default)

| Role        | Email                    | Password   |
| ----------- | ------------------------ | ---------- |
| Recruiter   | recruiter@demo.com       | secret123  |
| Interviewee | interviewee@demo.com     | secret123  |

Copy `.env.example` to `.env` to configure the API URL (`VITE_API_URL`)
and disable mock mode (`VITE_ENABLE_MOCK=false`) once the backend is live.

## Project structure

```
src/
├── app/          Redux store configuration
├── assets/       Static assets
├── components/
│   ├── common/   Reusable UI primitives (Button, Card, Modal, …)
│   ├── forms/    Form primitives (Input, Select, Checkbox, …)
│   └── layout/   App shell, Navbar, Sidebar, layouts
├── features/     Feature slices (auth, ui, assessments, results, …)
├── hooks/        Custom hooks (useAuth, useMediaQuery, …)
├── pages/        Route pages (auth, recruiter, interviewee, assessment)
├── routes/       Router config + route guards
├── services/     API service layer
├── utils/        Shared constants & validation helpers
```

Custom feature folders (for other team members) will live under `src/features/`
and `src/pages/`, reusing the common components and design tokens.

## Design system

Design tokens (colors, typography, spacing, radius, shadows, status colors,
responsive breakpoints) live in `src/index.css` under `:root`. All member
contributions must use these CSS custom properties (e.g. `var(--color-primary)`)
instead of ad-hoc values.

## Routing

- `/login`, `/register` — public, redirect logged-in users to their home
- `/recruiter/*` — recruiter-only (requires `recruiter` role)
- `/interviewee/*` — interviewee-only (requires `interviewee` role)
- `/assessment/:id` — authenticated
- `*` → 404 page

Route guards live in `src/routes/guards.jsx`.