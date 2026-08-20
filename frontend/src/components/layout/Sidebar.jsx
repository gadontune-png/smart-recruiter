import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  FileQuestion,
  Send,
  TrendingUp,
  Settings,
  GraduationCap,
  LineChart,
  AppWindow,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ROLES, ROUTES, APP_NAME } from "../../utils/constants";

const NAV_GROUPS = Object.freeze({
  [ROLES.RECRUITER]: [
    {
      heading: "Recruiter",
      items: [
        { label: "Dashboard", to: ROUTES.RECRUITER.DASHBOARD, icon: LayoutDashboard },
        { label: "Assessments", to: ROUTES.RECRUITER.ASSESSMENTS, icon: ClipboardList },
        { label: "Questions", to: ROUTES.RECRUITER.QUESTIONS, icon: FileQuestion },
        { label: "Invitations", to: ROUTES.RECRUITER.INVITATIONS, icon: Send },
        { label: "Results", to: ROUTES.RECRUITER.RESULTS, icon: TrendingUp },
        { label: "Settings", to: ROUTES.RECRUITER.SETTINGS, icon: Settings },
      ],
    },
  ],
  [ROLES.INTERVIEWEE]: [
    {
      heading: "Interviewee",
      items: [
        { label: "Dashboard", to: ROUTES.INTERVIEWEE.DASHBOARD, icon: GraduationCap },
        { label: "My Assessments", to: ROUTES.INTERVIEWEE.ASSESSMENTS, icon: ClipboardList },
        { label: "Practice", to: ROUTES.INTERVIEWEE.PRACTICE, icon: AppWindow },
        { label: "Results", to: ROUTES.INTERVIEWEE.RESULTS, icon: LineChart },
        { label: "Settings", to: ROUTES.INTERVIEWEE.SETTINGS, icon: Settings },
      ],
    },
  ],
});

function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const groups = NAV_GROUPS[user?.role] ?? [];

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`sidebar ${isOpen ? "sidebar-open" : ""}`}
        aria-label="Sidebar navigation"
      >
        <div className="sidebar-brand">
          <span className="sidebar-logo" aria-hidden="true">
            SR
          </span>
          {APP_NAME}
        </div>

        {groups.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <p className="sidebar-heading">{group.heading}</p>
            <ul className="sidebar-nav">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className="sidebar-link"
                    onClick={onClose}
                  >
                    <span className="sidebar-icon" aria-hidden="true">
                      {item.icon ? <item.icon size={18} /> : null}
                    </span>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {user && (
          <NavLink to={ROUTES.PROFILE} className="sidebar-profile" onClick={onClose}>
            <span className="avatar" aria-hidden="true">
              {user.name
                ?.split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "U"}
            </span>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--color-text-muted)",
                  textTransform: "capitalize",
                }}
              >
                {user.role}
              </div>
            </div>
          </NavLink>
        )}
      </aside>
    </>
  );
}

export default Sidebar;