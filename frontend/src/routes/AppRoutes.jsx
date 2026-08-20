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
import RecruiterQuestionsPage from "../pages/recruiter/RecruiterQuestionsPage";
import RecruiterInvitationsPage from "../pages/recruiter/RecruiterInvitationsPage";
import RecruiterResultsPage from "../pages/recruiter/RecruiterResultsPage";
import RecruiterGradingPage from "../pages/recruiter/RecruiterGradingPage";
import RecruiterSettingsPage from "../pages/recruiter/RecruiterSettingsPage";

import IntervieweeDashboardPage from "../pages/interviewee/IntervieweeDashboardPage";
import IntervieweeAssessmentsPage from "../pages/interviewee/IntervieweeAssessmentsPage";
import IntervieweeResultsPage from "../pages/interviewee/IntervieweeResultsPage";
import IntervieweeInvitationsPage from "../pages/interviewee/IntervieweeInvitationsPage";
import IntervieweeNotificationsPage from "../pages/interviewee/IntervieweeNotificationsPage";
import IntervieweeSettingsPage from "../pages/interviewee/IntervieweeSettingsPage";

import AssessmentPage from "../pages/assessment/AssessmentPage";

import TrialAssessmentPage from "../pages/trial/TrialAssessmentPage";

import WhiteboardPage from "../pages/whiteboard/WhiteboardPage";

import ProfilePage from "../pages/profile/ProfilePage";

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
          <AuthLayout title="Welcome Back" subtitle="Sign in to manage your technical challenges">
            <LoginPage />
          </AuthLayout>
        ),
      },
      {
        path: ROUTES.REGISTER,
        element: (
          <AuthLayout title="Create Account" subtitle="Get started with automated assessment tools">
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
            path: ROUTES.PROFILE,
            element: <ProfilePage />,
          },
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
                path: ROUTES.RECRUITER.QUESTIONS,
                element: <RecruiterQuestionsPage />,
              },
              {
                path: ROUTES.RECRUITER.INVITATIONS,
                element: <RecruiterInvitationsPage />,
              },
              {
                path: ROUTES.RECRUITER.RESULTS,
                element: <RecruiterResultsPage />,
              },
              {
                path: ROUTES.RECRUITER.GRADING,
                element: <RecruiterGradingPage />,
              },
              {
                path: ROUTES.RECRUITER.SETTINGS,
                element: <RecruiterSettingsPage />,
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
                path: ROUTES.INTERVIEWEE.INVITATIONS,
                element: <IntervieweeInvitationsPage />,
              },
              {
                path: ROUTES.INTERVIEWEE.NOTIFICATIONS,
                element: <IntervieweeNotificationsPage />,
              },
              {
                path: ROUTES.INTERVIEWEE.SETTINGS,
                element: <IntervieweeSettingsPage />,
              },
              {
                path: ROUTES.INTERVIEWEE.PRACTICE,
                element: <TrialAssessmentPage />,
              },
              {
                path: ROUTES.TRIAL,
                element: <TrialAssessmentPage />,
              },
              {
                path: ROUTES.WHITEBOARD,
                element: <WhiteboardPage />,
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