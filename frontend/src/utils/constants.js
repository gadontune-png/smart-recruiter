export const APP_NAME = import.meta.env.VITE_APP_NAME || "Smart Recruiter";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const ENABLE_MOCK = (import.meta.env.VITE_ENABLE_MOCK ?? "true") === "true";

export const ROLES = Object.freeze({
  RECRUITER: "recruiter",
  INTERVIEWEE: "interviewee",
});

export const ROUTES = Object.freeze({
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  NOT_FOUND: "/404",
  RECRUITER: {
    DASHBOARD: "/recruiter/dashboard",
    ASSESSMENTS: "/recruiter/assessments",
    CANDIDATES: "/recruiter/candidates",
    ADD_ASSESSMENT: "/recruiter/assessments/new",
  },
  INTERVIEWEE: {
    DASHBOARD: "/interviewee/dashboard",
    ASSESSMENTS: "/interviewee/assessments",
    RESULTS: "/interviewee/results",
  },
  ASSESSMENT: "/assessment/:id",
});

export const STORAGE_KEYS = Object.freeze({
  AUTH: "sr_auth",
  THEME: "sr_theme",
});