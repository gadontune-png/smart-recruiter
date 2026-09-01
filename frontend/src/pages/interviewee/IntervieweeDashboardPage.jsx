import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  ArrowRight,
  CheckCircle2,
  Trophy,
  CalendarClock,
  Gauge,
} from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { useAuth } from "../../hooks/useAuth";
import {
  invitationService,
  notificationService,
  assessmentService,
} from "../../services/assessmentService";
import { ROUTES } from "../../utils/constants";
import "./interviewee-dashboard.css";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function IntervieweeDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [invitations, setInvitations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.user_id) return;

    const fetchData = async () => {
      try {
        const [invData, notifData, assessData] = await Promise.all([
          invitationService.listInvitations(),
          notificationService.listNotifications(user.user_id),
          assessmentService.listAssessments(),
        ]);

        setInvitations(Array.isArray(invData) ? invData : []);
        setNotifications(Array.isArray(notifData) ? notifData : []);
        setAssessments(Array.isArray(assessData) ? assessData : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.user_id]);

  const completedCount = invitations.filter((inv) => inv.status === "ACCEPTED").length;
  const pendingCount = invitations.filter((inv) => inv.status === "PENDING" || inv.status === "ACCEPTED").length;

  const upcoming = invitations
    .filter((inv) => inv.status === "PENDING" || inv.status === "ACCEPTED")
    .map((inv) => {
      const assessment = assessments.find((a) => a.assessment_id === inv.assessment_id);
      const isExpired = inv.expires_at && new Date(inv.expires_at) < new Date();
      return { ...inv, assessment, isExpired };
    });

  const stats = [
    { label: "Assessments Completed", value: String(completedCount), delta: completedCount > 0 ? "Ready for review" : "No completed assessments yet", icon: CheckCircle2 },
    { label: "Upcoming", value: String(pendingCount), delta: pendingCount > 0 ? "Next testing window soon" : "No upcoming assessments", icon: CalendarClock },
    { label: "Average Score", value: invitations.length ? "--" : "0%", delta: completedCount > 0 ? "Based on completed assessments" : "Complete assessments to see score", icon: Gauge },
    { label: "Global Rank", value: "N/A", delta: "Complete assessments to earn a rank", icon: Trophy },
  ];

  const activities = notifications.slice(0, 5).map((notif) => ({
    text: notif.message,
    time: timeAgo(notif.created_at),
    tone: notif.type === "invitation" ? "info" : notif.type === "result" ? "success" : "neutral",
  }));

  if (loading) {
    return (
      <div className="interviewee-dashboard">
        <div className="page-header">
          <p className="breadcrumb">Smart Recruiter / Dashboard</p>
        </div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="interviewee-dashboard">
        <div className="page-header">
          <p className="breadcrumb">Smart Recruiter / Dashboard</p>
        </div>
        <p>Error: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="interviewee-dashboard">
      <div className="page-header">
        <p className="breadcrumb">Smart Recruiter / Dashboard</p>
      </div>

      <section className="welcome-banner">
        <div>
          <span className="welcome-kicker">
            <span className="welcome-pulse" aria-hidden="true" />
            Interview Ready
          </span>
          <h1>Welcome back, {user?.full_name || "Interviewee"}!</h1>
          <p>
            &quot;The beautiful thing about learning is nobody can take it away
            from you.&quot;
          </p>
          <span>Practice daily to sharpen your coding skills and climb the leaderboard.</span>
        </div>
        <span className="welcome-badge">{user?.role || "Interviewee"}</span>
      </section>

      <div className="stat-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <span className="stat-card-icon stat-icon-blue">
              <stat.icon size={20} />
            </span>
            <div>
              <div className="stat-card-label">{stat.label}</div>
              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-delta">{stat.delta}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-split">
        <section>
          <div className="panel-heading">
            <h2>Upcoming Assessments</h2>
          </div>
          <div className="upcoming-list">
            {upcoming.length === 0 && (
              <div className="panel upcoming-card">
                <p className="upcoming-meta">No upcoming assessments.</p>
              </div>
            )}
            {upcoming.map((item) => (
              <div className="panel upcoming-card" key={item.id}>
                <div className="upcoming-card-top">
                  <h3>{item.assessment?.title || `Assessment #${item.assessment_id}`}</h3>
                  {(item.isExpired || item.status === "EXPIRED") && (
                    <Badge variant="neutral"><Lock size={12} /> Expired</Badge>
                  )}
                  {item.status === "ACCEPTED" && (
                    <Badge variant="info"><ArrowRight size={12} /> Accepted</Badge>
                  )}
                </div>
                <p className="upcoming-meta">
                  {item.scheduled_at && `Scheduled: ${new Date(item.scheduled_at).toLocaleString()}`}
                  {item.assessment?.time_limit_minutes && ` · Duration: ${item.assessment.time_limit_minutes} mins`}
                  {item.assessment?.description && ` · ${item.assessment.description}`}
                </p>
                {item.isExpired || item.status === "EXPIRED" ? (
                  <Button variant="secondary" disabled>
                    <Lock size={16} />
                    Expired
                  </Button>
                ) : (
                  <Button onClick={() => navigate(ROUTES.ASSESSMENT.replace(":id", item.assessment_id))}>
                    Start <ArrowRight size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="panel-heading">
            <h2>Recent Activity</h2>
          </div>
          <div className="panel activity-panel">
            <ul className="activity-list">
              {activities.length === 0 && (
                <li className="activity-item">
                  <span className="activity-dot activity-neutral" />
                  <div>
                    <p>No recent activity.</p>
                    <span></span>
                  </div>
                </li>
              )}
              {activities.map((activity) => (
                <li className="activity-item" key={activity.text}>
                  <span className={`activity-dot activity-${activity.tone}`} />
                  <div>
                    <p>{activity.text}</p>
                    <span>{activity.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel-heading">
            <h2>Practice</h2>
          </div>
          <div className="panel practice-card">
            <p>
              Trial assessments simulate the real interview environment so you can
              sharpen your skills with zero risk.
            </p>
            <Button variant="outline" onClick={() => navigate(ROUTES.TRIAL)}>
              Start a Trial Assessment
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default IntervieweeDashboardPage;
