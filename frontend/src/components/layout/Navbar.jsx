import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { ROLES, ROUTES } from "../../utils/constants";
import { notificationService } from "../../services/assessmentService";

function Topbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.user_id) return;
    let cancelled = false;
    const load = () => {
      notificationService
        .listNotifications()
        .then((data) => {
          if (cancelled) return;
          const items = Array.isArray(data) ? data : [];
          setUnreadCount(items.filter((n) => !n.is_read).length);
        })
        .catch(() => {
          if (!cancelled) setUnreadCount(0);
        });
    };
    load();
    const interval = window.setInterval(load, 20000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [user?.user_id]);

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

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "";

  const displayName = user?.full_name || user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
            <button
              type="button"
              className="topbar-icon-btn"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
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
              {unreadCount > 0 && (
                <span className="topbar-notif-badge">{unreadCount}</span>
              )}
            </Link>
            <Link to={ROUTES.PROFILE} className="topbar-user" aria-label="View profile">
              <span className="avatar" aria-hidden="true">
                {initials}
              </span>
              <div className="topbar-user-meta">
                <strong>{displayName}</strong>
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