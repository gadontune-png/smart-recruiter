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
import { ROUTES } from "../../utils/constants";
import "./interviewee-dashboard.css";

const STATS = [
  { label: "Assessments Completed", value: "3", delta: "Ready for review", icon: CheckCircle2 },
  { label: "Upcoming", value: "2", delta: "Next testing window: tomorrow", icon: CalendarClock },
  { label: "Average Score", value: "78%", delta: "Stable performance", icon: Gauge },
  { label: "Global Rank", value: "Top 15%", delta: "Top 10% milestone near", icon: Trophy },
];

const UPCOMING = [
  {
    title: "Acme Corp Front-End Evaluation",
    meta: "Starts: Oct 24, 10:00 AM  ·  Duration: 90 mins  ·  Focus: React, JS Essentials",
    locked: false,
  },
  {
    title: "DevOps & Cloud Orchestration",
    meta: "Starts: Oct 26, 2:00 PM  ·  Duration: 120 mins  ·  Focus: Docker, K8s Architecture",
    locked: true,
  },
];

const ACTIVITIES = [
  { text: "Completed Practice Test: React Performance Hookups", time: "2 hours ago", tone: "success" },
  { text: "Accepted Interview Invitation from Stripe", time: "1 day ago", tone: "info" },
  { text: "Profile evaluated by Assessment Engine", time: "3 days ago", tone: "neutral" },
];

function IntervieweeDashboardPage() {
  const navigate = useNavigate();

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
          <h1>Welcome back, Alex Rivera!</h1>
          <p>
            &quot;The beautiful thing about learning is nobody can take it away
            from you.&quot;
          </p>
          <span>Practice daily to sharpen your coding skills and climb the leaderboard.</span>
        </div>
        <span className="welcome-badge">Developer Role</span>
      </section>

      <div className="stat-grid">
        {STATS.map((stat) => (
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
            {UPCOMING.map((assessment) => (
              <div className="panel upcoming-card" key={assessment.title}>
                <div className="upcoming-card-top">
                  <h3>{assessment.title}</h3>
                  {assessment.locked && <Badge variant="neutral"><Lock size={12} /> Locked</Badge>}
                </div>
                <p className="upcoming-meta">{assessment.meta}</p>
                {assessment.locked ? (
                  <Button variant="secondary" disabled>
                    <Lock size={16} />
                    Locked
                  </Button>
                ) : (
                  <Button onClick={() => navigate(ROUTES.ASSESSMENT.replace(":id", "5"))}>
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
              {ACTIVITIES.map((activity) => (
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