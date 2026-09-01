import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  invitationService,
  notificationService,
} from "../../services/assessmentService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import "./interviewee-assessments.css";

function IntervieweeAssessmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [invitations, setInvitations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [confirmation, setConfirmation] = useState("");

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

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  function acceptInvitation(invitationId) {
    invitationService
      .acceptInvitation(invitationId)
      .then(() => {
        setInvitations((current) =>
          current.map((inv) =>
            inv.invitation_id === invitationId
              ? { ...inv, status: "ACCEPTED" }
              : inv
          )
        );
        setConfirmation("Invitation accepted successfully.");
      })
      .catch(() => setConfirmation("Failed to accept invitation."));
  }

  function markAsRead(id) {
    notificationService
      .markAsRead(id)
      .then(() => {
        setNotifications((current) =>
          current.map((n) =>
            n.notification_id === id ? { ...n, is_read: true } : n
          )
        );
      })
      .catch(() => {});
  }

  function markAllAsRead() {
    notifications
      .filter((n) => !n.is_read)
      .forEach((n) => markAsRead(n.notification_id));
  }

  return (
    <div className="interviewee-assessments">
      <div className="assessments-header">
        <div className="page-header">
          <p className="breadcrumb">Smart Recruiter / My Invitations</p>
          <h1>Invitations &amp; Updates</h1>
          <p className="page-header-desc">
            Manage your assessment invitations and stay updated.
          </p>
        </div>

        <div className="notification-wrapper">
          <Button
            variant="outline"
            ariaLabel="View notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
            Notifications
            {unreadCount > 0 && (
              <span className="notification-count">{unreadCount}</span>
            )}
          </Button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <strong>Notifications</strong>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead}>Mark all as read</button>
                )}
              </div>
              {notifications.length === 0 ? (
                <EmptyState
                  title="No notifications"
                  description="You're all caught up."
                />
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.notification_id}
                    className={`notification-item ${
                      !notification.is_read ? "unread" : ""
                    }`}
                    onClick={() => markAsRead(notification.notification_id)}
                  >
                    <div className="notification-icon">
                      <Bell size={16} />
                    </div>
                    <div>
                      <strong>{notification.title}</strong>
                      <p>{notification.message}</p>
                      <small>{notification.created_at}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {confirmation && (
        <div className="confirmation-message">
          <Check size={18} />
          {confirmation}
        </div>
      )}

      <section>
        <div className="section-heading">
          <h2>Assessment Invitations</h2>
          <Badge variant="info">{invitations.length} Invitations</Badge>
        </div>

        {invitations.length === 0 ? (
          <EmptyState
            title="No invitations"
            description="You don't have any assessment invitations at the moment."
          />
        ) : (
          <div className="invitation-list">
            {invitations.map((invitation) => (
              <Card key={invitation.invitation_id} padded>
                <div className="invitation-card">
                  <div className="invitation-content">
                    <div className="invitation-title-row">
                      <h3>Assessment #{invitation.assessment_id}</h3>
                      <Badge
                        variant={
                          invitation.status === "ACCEPTED"
                            ? "success"
                            : invitation.status === "EXPIRED"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {invitation.status}
                      </Badge>
                    </div>

                    <div className="invitation-details">
                      <span>
                        <strong>Invited:</strong>{" "}
                        {invitation.invited_at
                          ? new Date(invitation.invited_at).toLocaleDateString()
                          : "N/A"}
                      </span>
                      {invitation.responded_at && (
                        <span>
                          <strong>Responded:</strong>{" "}
                          {new Date(invitation.responded_at).toLocaleDateString()}
                        </span>
                      )}
                      <span>
                        <strong>Status:</strong> {invitation.status}
                      </span>
                    </div>
                  </div>

                  <div className="invitation-actions">
                    {invitation.status === "PENDING" ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          acceptInvitation(invitation.invitation_id)
                        }
                      >
                        <Check size={16} />
                        Accept
                      </Button>
                    ) : invitation.status === "ACCEPTED" ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/assessment/${invitation.assessment_id}`
                          )
                        }
                      >
                        View Assessment
                      </Button>
                    ) : (
                      <Badge variant="danger">{invitation.status}</Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="trial-assessment-section">
        <div className="section-heading">
          <h2>Practice Assessment</h2>
          <Badge variant="info">Trial</Badge>
        </div>
        <Card padded>
          <div className="invitation-card">
            <div className="invitation-content">
              <div className="invitation-title-row">
                <h3>Trial Assessment</h3>
                <Badge variant="info">Practice</Badge>
              </div>
              <p>
                Get familiar with the assessment experience before taking a
                real technical assessment.
              </p>
              <div className="invitation-details">
                <span>
                  <strong>Questions:</strong> 3
                </span>
                <span>
                  <strong>Types:</strong> Multiple Choice, Free Text &amp; Coding
                </span>
                <span>
                  <strong>Mode:</strong> Trial
                </span>
              </div>
            </div>
            <div className="invitation-actions">
              <Button size="sm" onClick={() => navigate("/trial")}>
                Start Trial
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <section className="notifications-section">
        <div className="section-heading">
          <h2>Recent Notifications</h2>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <Card>
          {notifications.length === 0 ? (
            <EmptyState
              title="No notifications"
              description="You don't have any notifications yet."
            />
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.notification_id}
                className={`notification-row ${
                  !notification.is_read ? "unread" : ""
                }`}
              >
                <div className="notification-icon">
                  <Bell size={18} />
                </div>
                <div className="notification-row-content">
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <small>{notification.created_at}</small>
                </div>
                {!notification.is_read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      markAsRead(notification.notification_id)
                    }
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            ))
          )}
        </Card>
      </section>
    </div>
  );
}

export default IntervieweeAssessmentsPage;
