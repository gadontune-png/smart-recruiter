import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import AuthLayout from "../components/layout/AuthLayout";
import { GuestOnly, RequireAuth, RequireRole } from "./guards";
import { ROUTES, ROLES } from "../utils/constants";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";

import RecruiterDashboardPage from "../pages/recruiter/RecruiterDashboardPage";
import RecruiterAssessmentsPage from "../pages/recruiter/RecruiterAssessmentsPage";
import RecruiterCandidatesPage from "../pages/recruiter/RecruiterCandidatesPage";

import IntervieweeDashboardPage from "../pages/interviewee/IntervieweeDashboardPage";
import IntervieweeAssessmentsPage from "../pages/interviewee/IntervieweeAssessmentsPage";
import IntervieweeResultsPage from "../pages/interviewee/IntervieweeResultsPage";

import AssessmentPage from "../pages/assessment/AssessmentPage";

import TrialAssessmentPage from "../pages/trial/TrialAssessmentPage";

export const router = createBrowserRouter([
  {
    element: <GuestOnly />,
    children: [
      {
        path: ROUTES.HOME,
        element: <Navigate to={ROUTES.LOGIN} replace />,
      },
      {
        path: ROUTES.LOGIN,
        element: (
          <AuthLayout subtitle="Sign in to your account">
            <LoginPage />
          </AuthLayout>
        ),
      },
      {
        path: ROUTES.REGISTER,
        element: (
          <AuthLayout subtitle="Create a new account">
            <RegisterPage />
          </AuthLayout>
        ),
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            element: <RequireRole roles={[ROLES.RECRUITER]} />,
            children: [
              {
                path: ROUTES.RECRUITER.DASHBOARD,
                element: <RecruiterDashboardPage />,
              },
              {
                path: ROUTES.RECRUITER.ASSESSMENTS,
                element: <RecruiterAssessmentsPage />,
              },
              {
                path: ROUTES.RECRUITER.CANDIDATES,
                element: <RecruiterCandidatesPage />,
              },
            ],
          },
          {
            element: <RequireRole roles={[ROLES.INTERVIEWEE]} />,
            children: [
              {
                path: ROUTES.INTERVIEWEE.DASHBOARD,
                element: <IntervieweeDashboardPage />,
              },
              {
                path: ROUTES.INTERVIEWEE.ASSESSMENTS,
                element: <IntervieweeAssessmentsPage />,
              },
              {
                path: ROUTES.INTERVIEWEE.RESULTS,
                element: <IntervieweeResultsPage />,
              },

              {
                 path: "/trial",
                element: <TrialAssessmentPage />,
            },

            ],
          },
          {
            path: ROUTES.ASSESSMENT,
            element: <AssessmentPage />,
          },
        ],
      },
    ],
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFoundPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);