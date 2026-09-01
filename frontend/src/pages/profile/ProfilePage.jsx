import { Link } from "react-router-dom";
import { Mail, Shield, Calendar, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ROLES, ROUTES } from "../../utils/constants";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import "./profile.css";

function ProfilePage() {
  const { user, logoutUser } = useAuth();

  if (!user) return null;

  const initials = user.full_name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isRecruiter = user.role === ROLES.RECRUITER;
  const settingsPath = isRecruiter
    ? ROUTES.RECRUITER.SETTINGS
    : ROUTES.INTERVIEWEE.SETTINGS;

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "N/A";

  const ACCOUNT_INFO = [
    { label: "Email Address", value: user.email || "N/A" },
    { label: "Role", value: user.role || "N/A" },
  ];

  return (
    <div className="profile-page">
      <div className="page-header">
        <p className="breadcrumb">Smart Recruiter / Profile</p>
      </div>

      <section className="profile-hero">
        <div className="profile-hero-avatar">{initials}</div>
        <div className="profile-hero-meta">
          <h1>{user.full_name || "User"}</h1>
          <p className="profile-hero-role">{user.role || "N/A"}</p>
          <div className="profile-hero-tags">
            <Badge variant={isRecruiter ? "info" : "success"}>{isRecruiter ? "Recruiter" : "Interviewee"}</Badge>
            <Badge variant="success">Active</Badge>
          </div>
        </div>
        <div className="profile-hero-stats">
          <div>
            <strong>N/A</strong>
            <span>Assessments</span>
          </div>
          <div>
            <strong>N/A</strong>
            <span>Candidates</span>
          </div>
          <div>
            <strong>N/A</strong>
            <span>Match Rate</span>
          </div>
        </div>
      </section>

      <div className="profile-columns">
        <section className="panel profile-card">
          <div className="panel-heading">
            <h2>Account Information</h2>
            <Link to={settingsPath} className="link-arrow">
              <Settings size={15} /> Settings
            </Link>
          </div>
          <div className="profile-info-list">
            {ACCOUNT_INFO.map((item) => (
              <div className="profile-info-row" key={item.label}>
                <span className="profile-info-label">{item.label}</span>
                <span className="profile-info-value">{item.value}</span>
              </div>
            ))}
            <div className="profile-info-row">
              <span className="profile-info-label">Member Since</span>
              <span className="profile-info-value">{memberSince}</span>
            </div>
          </div>
          <div className="profile-card-foot">
            <Button
              variant="danger"
              onClick={logoutUser}
            >
              <LogOut size={16} /> Sign out
            </Button>
          </div>
        </section>

        <section className="panel profile-card">
          <div className="panel-heading">
            <h2>Quick Links</h2>
          </div>
          <div className="profile-links">
            <Link to={settingsPath} className="profile-link">
              <Shield size={18} />
              <div>
                <strong>Account Settings</strong>
                <span>Manage password, notifications and privacy</span>
              </div>
            </Link>
            <Link
              to={isRecruiter ? ROUTES.RECRUITER.RESULTS : ROUTES.INTERVIEWEE.RESULTS}
              className="profile-link"
            >
              <Mail size={18} />
              <div>
                <strong>Reports</strong>
                <span>View your assessment reports and statistics</span>
              </div>
            </Link>
            <Link to={isRecruiter ? ROUTES.RECRUITER.ASSESSMENTS : ROUTES.INTERVIEWEE.ASSESSMENTS} className="profile-link">
              <Calendar size={18} />
              <div>
                <strong>{isRecruiter ? "Assessments" : "My Assessments"}</strong>
                <span>Browse your assessments and invites</span>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;