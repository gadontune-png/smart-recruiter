import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ROLES, ROUTES, APP_NAME } from "../../utils/constants";
import UserMenu from "./UserMenu";

function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();

  const home =
    user?.role === ROLES.RECRUITER
      ? ROUTES.RECRUITER.DASHBOARD
      : ROUTES.INTERVIEWEE.DASHBOARD;

  return (
    <header className="navbar">
      <div className="navbar-actions">
        <button
          type="button"
          className="navbar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
        <Link to={home} className="navbar-brand">
          <span className="navbar-logo" aria-hidden="true">
            SR
          </span>
          {APP_NAME}
        </Link>
      </div>
      <div className="navbar-actions">
        {user ? (
          <UserMenu />
        ) : (
          <>
            <Link to={ROUTES.LOGIN} className="btn btn-secondary btn-sm">
              Log in
            </Link>
            <Link to={ROUTES.REGISTER} className="btn btn-primary btn-sm">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;