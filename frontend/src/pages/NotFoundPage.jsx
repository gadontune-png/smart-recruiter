import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../utils/constants";
import { APP_NAME } from "../utils/constants";

function NotFoundPage() {
  const { user } = useAuth();
  const home =
    user?.role === "recruiter" ? ROUTES.RECRUITER.DASHBOARD : ROUTES.INTERVIEWEE.DASHBOARD;

  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>Page not found</h2>
      <p>
        The page you're looking for doesn't exist. It may have been moved or removed.
      </p>
      <Link to={user ? home : ROUTES.HOME} className="btn btn-primary">
        {user ? `Back to ${APP_NAME}` : "Go home"}
      </Link>
    </div>
  );
}

export default NotFoundPage;