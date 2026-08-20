import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Menu, Search } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ROLES, ROUTES } from "../../utils/constants";

function Topbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  const home =
    user?.role === ROLES.RECRUITER
      ? ROUTES.RECRUITER.DASHBOARD
      : ROUTES.INTERVIEWEE.DASHBOARD;

  const isRecruiter = user?.role === ROLES.RECRUITER;

  const searchPlaceholder = isRecruiter
    ? "Search candidates, questions..."
    : "Search assessments, tutorials...";

  const searchPath = isRecruiter
    ? ROUTES.RECRUITER.RESULTS
    : ROUTES.INTERVIEWEE.ASSESSMENTS;

  const roleLabel = isRecruiter ? "System Admin" : "Developer Role";

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "U";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="navbar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} aria-hidden="true" />
        </button>

        <Link to={home} className="topbar-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search"
            onKeyDown={(event) => {
              if (event.key === "Enter" && query.trim()) {
                window.location.href = searchPath;
              }
            }}
          />
        </Link>
      </div>

      <div className="topbar-actions">
        {user ? (
          <>
            <Link
              to={
                isRecruiter
                  ? ROUTES.RECRUITER.RESULTS
                  : ROUTES.INTERVIEWEE.NOTIFICATIONS
              }
              className="topbar-icon-btn"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </Link>
            <Link to={ROUTES.PROFILE} className="topbar-user" aria-label="View profile">
              <span className="avatar" aria-hidden="true">
                {initials}
              </span>
              <div className="topbar-user-meta">
                <strong>{user.name}</strong>
                <span>{roleLabel}</span>
              </div>
            </Link>
          </>
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

export default Topbar;