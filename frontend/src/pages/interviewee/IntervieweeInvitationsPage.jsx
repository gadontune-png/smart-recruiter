import { useState, useEffect } from "react";
import { Bell, Check, ArrowRight, Building2, Play, X } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  invitationService,
  notificationService,
} from "../../services/assessmentService";
import { ROUTES } from "../../utils/constants";
import "./interviewee-invitations.css";

function IntervieweeInvitationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    invitationService
      .listInvitations()
      .then((data) => setInvitations(Array.isArray(data) ? data : []))
      .catch(() => setInvitations([]));
  }, []);

  useEffect(() => {
    if (!user?.user_id) return;
    notificationService
      .listNotifications(user.user_id)
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]));
  }, [user?.user_id]);

  function accept(id) {
    const invitation = invitations.find((inv) => inv.invitation_id === id);
    invitationService
      .acceptInvitation(id)
      .then(() => {
        setInvitations((current) =>
          current.map((inv) =>
            inv.invitation_id === id ? { ...inv, status: "ACCEPTED" } : inv
          )
        );
        navigate(ROUTES.ASSESSMENT.replace(":id", invitation?.assessment_id || ""));
      })
      .catch(() => {});
  }

  function decline(id) {
    setInvitations(invitations.filter((inv) => inv.invitation_id !== id));
  }

  function markAllRead() {
    const unread = notifications.filter((n) => !n.is_read);
    unread.forEach((n) => notificationService.markAsRead(n.notification_id).catch(() => {}));
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
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
                <div className="panel invite-card-row" key={invitation.invitation_id}>
                  <div className="company-badge">
                    <Building2 size={22} />
                  </div>
                  <div className="invite-content">
                    <div className="invite-role">
                      <strong>{invitation.title}</strong>
                      <span>{invitation.description}</span>
                    </div>
                    <p className="invite-meta">
                      Status: {invitation.status}
                    </p>
                  </div>
                  <div className="invite-actions">
                    <Button variant="secondary" onClick={() => decline(invitation.invitation_id)}>
                      <X size={16} />
                      Decline
                    </Button>
                    <Button onClick={() => accept(invitation.invitation_id)}>
                      <Play size={16} />
                      Accept &amp; Begin
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

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
                <div className={`notif-item ${notification.is_read ? "read" : ""}`} key={notification.notification_id}>
                  <span className={`notif-dot ${notification.is_read ? "" : "unread"}`} />
                  <div>
                    <strong>{notification.title}</strong>
                    <span>{notification.message}</span>
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
