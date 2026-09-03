import { useState, useEffect } from "react";
import { Bell, Check, ArrowRight, Building2, Play, X, CheckCircle2 } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { useNavigate } from "react-router-dom";
import {
  invitationService,
  notificationService,
  attemptService,
} from "../../services/assessmentService";
import { ROUTES } from "../../utils/constants";
import "./interviewee-invitations.css";

function IntervieweeInvitationsPage() {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [attemptStatus, setAttemptStatus] = useState({});

  useEffect(() => {
    invitationService
      .listInvitations()
      .then(async (data) => {
        const list = Array.isArray(data) ? data : [];
        setInvitations(list);
        const statuses = {};
        await Promise.all(
          list
            .filter((inv) => inv.status === "ACCEPTED")
            .map(async (inv) => {
              const res = await attemptService
                .getAttemptStatus(inv.assessment_id)
                .catch(() => null);
              if (res) statuses[inv.assessment_id] = res;
            })
        );
        setAttemptStatus(statuses);
      })
      .catch(() => setInvitations([]));
  }, []);

  useEffect(() => {
    notificationService
      .listNotifications()
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]));
  }, []);

  const isSubmitted = (invitation) =>
    attemptStatus[invitation.assessment_id]?.locked &&
    !attemptStatus[invitation.assessment_id]?.active;

  const attemptUsed = (invitation) => {
    const a = attemptStatus[invitation.assessment_id];
    return a && a.max_attempts > 0
      ? `${a.used_attempts ?? 0}/${a.max_attempts} attempt${
          a.max_attempts === 1 ? "" : "s"
        } used`
      : "";
  };

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
    invitationService
      .declineInvitation(id)
      .then(() => {
        setInvitations((current) =>
          current.map((inv) =>
            inv.invitation_id === id ? { ...inv, status: "EXPIRED" } : inv
          )
        );
      })
      .catch(() => {});
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
              {[...invitations]
                .sort(
                  (a, b) =>
                    new Date(b.invited_at || 0).getTime() -
                    new Date(a.invited_at || 0).getTime()
                )
                .map((invitation) => (
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
                      Status:{" "}
                      {isSubmitted(invitation) ? "Submitted" : invitation.status}
                      {isSubmitted(invitation) && attemptUsed(invitation)
                        ? ` (${attemptUsed(invitation)})`
                        : ""}
                    </p>
                  </div>
                  <div className="invite-actions">
                    {isSubmitted(invitation) ? (
                      <Button variant="secondary" disabled>
                        <CheckCircle2 size={16} />
                        Submitted
                      </Button>
                    ) : invitation.status === "PENDING" ? (
                      <>
                        <Button variant="secondary" onClick={() => decline(invitation.invitation_id)}>
                          <X size={16} />
                          Decline
                        </Button>
                        <Button onClick={() => accept(invitation.invitation_id)}>
                          <Play size={16} />
                          Accept &amp; Begin
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => navigate(ROUTES.ASSESSMENT.replace(":id", invitation.assessment_id))}>
                        View Assessment
                      </Button>
                    )}
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
              [...notifications]
                .sort(
                  (a, b) =>
                    new Date(b.created_at || 0).getTime() -
                    new Date(a.created_at || 0).getTime()
                )
                .map((notification) => (
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
