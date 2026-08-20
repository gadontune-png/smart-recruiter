import { useState } from "react";
import { Bell, Check, ArrowRight, Building2, Play, X } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/constants";
import "./interviewee-invitations.css";

const PENDING = [
  {
    id: 1,
    company: "Stripe Inc.",
    role: "Senior Backend Engineer Challenge",
    deadline: "Oct 30, 2026",
    estimate: "120 mins",
    type: "Live Coding",
  },
  {
    id: 2,
    company: "Vercel",
    role: "Front-End Infrastructure Assessment",
    deadline: "Nov 02, 2026",
    estimate: "90 mins",
    type: "Infrastructure, React Server Components",
  },
];

const NOTIFICATIONS = [
  {
    title: "Stripe invited you to test",
    sub: "Active till Oct 31, 2026",
    read: false,
  },
  {
    title: "Scored: 82% (Excellent)",
    sub: "Results: System Design Pro",
    read: false,
  },
];

function IntervieweeInvitationsPage() {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState(PENDING);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  function accept(id) {
    setInvitations(invitations.filter((inv) => inv.id !== id));
    navigate(ROUTES.ASSESSMENT.replace(":id", "7"));
  }

  function decline(id) {
    setInvitations(invitations.filter((inv) => inv.id !== id));
  }

  function markAllRead() {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="interviewee-invitations">
      <div className="page-header invitations-header">
        <div>
          <p className="breadcrumb">Smart Recruiter / My Invitations</p>
          <h1>Invitations &amp; Updates</h1>
        </div>
      </div>

      <div className="invite-layout">
        <div className="invite-main">
          <div className="panel-heading">
            <h2>Pending Invitations</h2>
            <Badge variant="info">{invitations.length} awaiting response</Badge>
          </div>

          {invitations.length === 0 ? (
            <div className="panel invite-empty">
              <Check size={28} />
              <p>You have no pending invitations. New ones will appear here.</p>
            </div>
          ) : (
            <div className="invite-card-list">
              {invitations.map((invitation) => (
                <div className="panel invite-card-row" key={invitation.id}>
                  <div className="company-badge">
                    <Building2 size={22} />
                  </div>
                  <div className="invite-content">
                    <div className="invite-role">
                      <strong>{invitation.company}</strong>
                      <span>{invitation.role}</span>
                    </div>
                    <p className="invite-meta">
                      Deadline: {invitation.deadline} · Estimate: {invitation.estimate} ·
                      Type: {invitation.type}
                    </p>
                  </div>
                  <div className="invite-actions">
                    <Button variant="secondary" onClick={() => decline(invitation.id)}>
                      <X size={16} />
                      Decline
                    </Button>
                    <Button onClick={() => accept(invitation.id)}>
                      <Play size={16} />
                      Accept &amp; Begin
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="panel-heading older-heading">
            <h2>Older Updates</h2>
          </div>
          <div className="panel older-panel">
            <p>
              <span className="older-dot" />
              Results available for Cloud Infrastructure Challenge — <a href="#r">View Report</a>
            </p>
          </div>
        </div>

        <aside className="invite-side">
          <div className="notifications-card">
            <div className="notifications-card-head">
              <Bell size={18} />
              <strong>Notifications</strong>
              <button type="button" onClick={markAllRead} className="mark-all">
                Mark all as read
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="no-notifications">You are all caught up.</p>
            ) : (
              notifications.map((notification) => (
                <div className={`notif-item ${notification.read ? "read" : ""}`} key={notification.title}>
                  <span className={`notif-dot ${notification.read ? "" : "unread"}`} />
                  <div>
                    <strong>{notification.title}</strong>
                    <span>{notification.sub}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="practice-card-side">
            <h3>Sharpen your skills</h3>
            <p>Try a trial assessment before the real thing. Free and unlimited.</p>
            <Button variant="outline" onClick={() => navigate(ROUTES.TRIAL)}>
              Start Practice <ArrowRight size={16} />
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default IntervieweeInvitationsPage;