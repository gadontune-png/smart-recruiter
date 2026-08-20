import { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import "./interviewee-assessments.css";

const initialInvitations = [
  {
    id: 1,
    title: "Frontend Developer Assessment",
    description:
      "Technical assessment covering JavaScript, React and frontend development.",
    date: "August 21, 2026",
    time: "10:00 AM - 11:00 AM",
    duration: "60 minutes",
    status: "Pending",
  },
  {
    id: 2,
    title: "JavaScript Fundamentals Assessment",
    description:
      "Assessment covering JavaScript fundamentals and problem solving.",
    date: "August 24, 2026",
    time: "2:00 PM - 3:00 PM",
    duration: "60 minutes",
    status: "Pending",
  },
];

const initialNotifications = [
  {
    id: 1,
    type: "Assessment invitation",
    message: "You have received a new assessment invitation.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "Assessment reminder",
    message: "Your Frontend Developer Assessment is tomorrow.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "Grade released",
    message: "Your JavaScript Assessment grade has been released.",
    time: "Yesterday",
    read: true,
  },
];

function IntervieweeAssessmentsPage() {
  const navigate = useNavigate();

  const [invitations, setInvitations] = useState(initialInvitations);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  function acceptInvitation(id) {
    setInvitations((currentInvitations) =>
      currentInvitations.map((invitation) =>
        invitation.id === id
          ? { ...invitation, status: "Accepted" }
          : invitation
      )
    );

    setConfirmation("Invitation accepted successfully.");
  }

  function declineInvitation(id) {
    setInvitations((currentInvitations) =>
      currentInvitations.map((invitation) =>
        invitation.id === id
          ? { ...invitation, status: "Declined" }
          : invitation
      )
    );

    setConfirmation("Invitation declined.");
  }

  function markAsRead(id) {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }

  function markAllAsRead() {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
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
                  <button onClick={markAllAsRead}>
                    Mark all as read
                  </button>
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
                    key={notification.id}
                    className={`notification-item ${
                      !notification.read ? "unread" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      <Bell size={16} />
                    </div>

                    <div>
                      <strong>{notification.type}</strong>
                      <p>{notification.message}</p>
                      <small>{notification.time}</small>
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
              <Card key={invitation.id} padded>
                <div className="invitation-card">
                  <div className="invitation-content">
                    <div className="invitation-title-row">
                      <h3>{invitation.title}</h3>

                      <Badge
                        variant={
                          invitation.status === "Accepted"
                            ? "success"
                            : invitation.status === "Declined"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {invitation.status}
                      </Badge>
                    </div>

                    <p>{invitation.description}</p>

                    <div className="invitation-details">
                      <span>
                        <strong>Date:</strong> {invitation.date}
                      </span>

                      <span>
                        <strong>Time:</strong> {invitation.time}
                      </span>

                      <span>
                        <strong>Duration:</strong> {invitation.duration}
                      </span>
                    </div>
                  </div>

                  <div className="invitation-actions">
                    {invitation.status === "Pending" ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => acceptInvitation(invitation.id)}
                        >
                          <Check size={16} />
                          Accept
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => declineInvitation(invitation.id)}
                        >
                          <X size={16} />
                          Decline
                        </Button>
                      </>
                    ) : invitation.status === "Accepted" ? (
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(`/assessment/${invitation.id}`)
                        }
                      >
                        View Assessment
                      </Button>
                    ) : (
                      <Badge variant="danger">Declined</Badge>
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
                  <strong>Types:</strong> Multiple Choice, Free Text & Coding
                </span>

                <span>
                  <strong>Mode:</strong> Trial
                </span>
              </div>
            </div>
            <div className="invitation-actions">
              <Button
                size="sm"
                onClick={() => navigate("/trial")}
              >
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
                key={notification.id}
                className={`notification-row ${
                  !notification.read ? "unread" : ""
                }`}
              >
                <div className="notification-icon">
                  <Bell size={18} />
                </div>

                <div className="notification-row-content">
                  <strong>{notification.type}</strong>
                  <p>{notification.message}</p>
                  <small>{notification.time}</small>
                </div>

                {!notification.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAsRead(notification.id)}
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