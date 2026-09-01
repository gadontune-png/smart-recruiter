import { useMemo, useState, useEffect } from "react";
import { Bell, CheckCheck, Clock3, Inbox, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { notificationService } from "../../services/assessmentService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import "./interviewee-notifications.css";

function IntervieweeNotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?.user_id) return;
    notificationService
      .listNotifications(user.user_id)
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]));
  }, [user?.user_id]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const handleMarkAsRead = (id) => {
    notificationService.markAsRead(id).catch(() => {});
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.notification_id === id ? { ...notification, is_read: true } : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    const unread = notifications.filter((n) => !n.is_read);
    unread.forEach((n) => notificationService.markAsRead(n.notification_id).catch(() => {}));
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({ ...notification, is_read: true }))
    );
  };

  const getCategoryFromType = (type) => {
    if (!type) return "General";
    const lower = type.toLowerCase();
    if (lower.includes("invitation")) return "Invitation";
    if (lower.includes("reminder")) return "Reminder";
    if (lower.includes("grade") || lower.includes("result")) return "Results";
    if (lower.includes("feedback")) return "Feedback";
    if (lower.includes("schedule")) return "Schedule";
    return "General";
  };

  return (
    <div className="interviewee-notifications">
      <div className="notifications-header">
        <div className="page-header">
          <p className="breadcrumb">Smart Recruiter / Notifications</p>
          <h1>Notifications</h1>
          <p className="page-header-desc">
            Stay informed about invitations, reminders, grades, and mentor feedback.
          </p>
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
            {notifications.map((notification) => {
              const category = getCategoryFromType(notification.title);
              return (
                <Card key={notification.notification_id} padded>
                  <div className={`notification-item ${notification.is_read ? "read" : "unread"}`}>
                    <div className="notification-badge-wrap">
                      <div className="notification-icon">
                        {category === "Invitation" ? <CheckCheck size={18} /> : category === "Reminder" ? <Clock3 size={18} /> : category === "Feedback" ? <Bell size={18} /> : <Inbox size={18} />}
                      </div>

                      <div className="notification-meta">
                        <div className="notification-head">
                          <Badge variant={notification.is_read ? "secondary" : "info"}>
                            {notification.notification_type || category}
                          </Badge>
                          {!notification.is_read && (
                            <span className="unread-dot" aria-label="Unread notification" />
                          )}
                        </div>

                        <h3>{notification.title}</h3>
                        <p>{notification.message}</p>
                        <div className="notification-footer">
                          <small>{notification.created_at}</small>
                        </div>
                      </div>
                    </div>

                    {!notification.is_read && (
                      <Button size="sm" variant="secondary" onClick={() => handleMarkAsRead(notification.notification_id)}>
                        Mark as read
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default IntervieweeNotificationsPage;
