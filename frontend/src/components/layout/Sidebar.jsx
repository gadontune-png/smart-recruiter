import { NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Users, Home, TrendingUp } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ROLES, ROUTES } from "../../utils/constants";

const NAV_GROUPS = Object.freeze({
  [ROLES.RECRUITER]: [
    {
      heading: "Recruiter",
      items: [
        { label: "Dashboard", to: ROUTES.RECRUITER.DASHBOARD, icon: LayoutDashboard },
        { label: "Assessments", to: ROUTES.RECRUITER.ASSESSMENTS, icon: ClipboardList },
        { label: "Candidates", to: ROUTES.RECRUITER.CANDIDATES, icon: Users },
      ],
    },
  ],
  [ROLES.INTERVIEWEE]: [
    {
      heading: "Interviewee",
      items: [
        { label: "Dashboard", to: ROUTES.INTERVIEWEE.DASHBOARD, icon: Home },
        { label: "Assessments", to: ROUTES.INTERVIEWEE.ASSESSMENTS, icon: ClipboardList },
        { label: "Results", to: ROUTES.INTERVIEWEE.RESULTS, icon: TrendingUp },
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
          <div className="sidebar-profile">
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
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;