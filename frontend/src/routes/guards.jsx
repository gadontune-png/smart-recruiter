import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../utils/constants";

function getHomePath(role) {
  if (role === "recruiter") return ROUTES.RECRUITER.DASHBOARD;
  return ROUTES.INTERVIEWEE.DASHBOARD;
}

export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

export function RequireRole({ roles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  }

  if (!roles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === "recruiter" ? ROUTES.RECRUITER.DASHBOARD : ROUTES.INTERVIEWEE.DASHBOARD}
        replace
      />
    );
  }

  return <Outlet />;
}

export function GuestOnly() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return <Outlet />;
}