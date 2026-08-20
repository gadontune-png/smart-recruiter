import { useMemo, useState } from "react";
import { Bell, CheckCheck, Clock3, Inbox, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import "./interviewee-notifications.css";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "Assessment invitation",
    title: "New assessment invitation received",
    message: "You have been invited to take the Frontend Developer Assessment on August 21 at 10:00 AM.",
    time: "10 minutes ago",
    category: "Invitation",
    read: false,
  },
  {
    id: 2,
    type: "Assessment reminder",
    title: "Upcoming assessment reminder",
    message: "Your JavaScript Fundamentals Assessment starts tomorrow at 2:00 PM. Please prepare your notes.",
    time: "2 hours ago",
    category: "Reminder",
    read: false,
  },
  {
    id: 3,
    type: "Grade released",
    title: "Assessment grade is available",
    message: "Your JavaScript Assessment grade has been released and is ready for review.",
    time: "Yesterday",
    category: "Results",
    read: true,
  },
  {
    id: 4,
    type: "Mentor feedback",
    title: "Mentor feedback received",
    message: "Your mentor left new feedback on the HTML & CSS Assessment. Review the comments and suggestions.",
    time: "2 days ago",
    category: "Feedback",
    read: false,
  },
  {
    id: 5,
    type: "Schedule update",
    title: "Assessment schedule changed",
    message: "The React Developer Assessment time has been updated. Please review the new schedule.",
    time: "3 days ago",
    category: "Schedule",
    read: true,
  },
];

function IntervieweeNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const handleMarkAsRead = (id) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  return (
    <div className="interviewee-notifications">
      <div className="notifications-header">
        <div>
          <p className="notifications-label">Interviewee Portal</p>
          <h1>Notifications</h1>
          <p>Stay informed about invitations, reminders, grades, and mentor feedback.</p>
        </div>

        <div className="header-actions">
          <Button variant="secondary" onClick={() => navigate("/interviewee/dashboard")}>
            <ArrowLeft size={16} />
            Dashboard
          </Button>
          <Button variant="secondary" onClick={() => navigate("/interviewee/invitations")}>
            Invitations
          </Button>
        </div>
      </div>

      <div className="notifications-summary">
        <Card padded>
          <span>Total notifications</span>
          <strong>{notifications.length}</strong>
        </Card>

        <Card padded>
          <span>Unread</span>
          <strong>{unreadCount}</strong>
        </Card>

        <Card padded>
          <span>Read</span>
          <strong>{notifications.length - unreadCount}</strong>
        </Card>
      </div>

      <section className="notifications-panel">
        <div className="notifications-panel-header">
          <div className="notification-title-wrap">
            <Bell size={18} />
            <h2>Recent updates</h2>
          </div>

          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You are all caught up. New updates will appear here."
          />
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <Card key={notification.id} padded>
                <div className={`notification-item ${notification.read ? "read" : "unread"}`}>
                  <div className="notification-badge-wrap">
                    <div className="notification-icon">
                      {notification.category === "Invitation" ? <CheckCheck size={18} /> : notification.category === "Reminder" ? <Clock3 size={18} /> : notification.category === "Feedback" ? <Bell size={18} /> : <Inbox size={18} />}
                    </div>

                    <div className="notification-meta">
                      <div className="notification-head">
                        <Badge variant={notification.read ? "secondary" : "info"}>
                          {notification.category}
                        </Badge>
                        {!notification.read && (
                          <span className="unread-dot" aria-label="Unread notification" />
                        )}
                      </div>

                      <h3>{notification.title}</h3>
                      <p>{notification.message}</p>
                      <div className="notification-footer">
                        <small>{notification.time}</small>
                        {notification.type && <span>{notification.type}</span>}
                      </div>
                    </div>
                  </div>

                  {!notification.read && (
                    <Button size="sm" variant="secondary" onClick={() => handleMarkAsRead(notification.id)}>
                      Mark as read
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default IntervieweeNotificationsPage;
