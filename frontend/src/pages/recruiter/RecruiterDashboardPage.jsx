import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  ArrowRight,
  CalendarClock,
  Trophy,
  Users,
  Gauge,
  ClipboardCheck,
  Loader2,
} from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { ROUTES, API_URL } from "../../utils/constants";
import { useAuth } from "../../hooks/useAuth";
import "./recruiter.css";

function statusVariant(status) {
  if (status === "PUBLISHED") return "success";
  if (status === "ARCHIVED") return "info";
  return "warning";
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function RecruiterDashboardPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("sr_auth")
          ? JSON.parse(localStorage.getItem("sr_auth")).token
          : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [assessRes, invRes] = await Promise.all([
          fetch(`${API_URL}/assessments/my`, { headers }),
          fetch(`${API_URL}/invitations`, { headers }),
        ]);

        if (!assessRes.ok) throw new Error("Failed to load assessments");
        if (!invRes.ok) throw new Error("Failed to load invitations");

        const assessmentsData = await assessRes.json();
        const invitationsData = await invRes.json();

        setAssessments(Array.isArray(assessmentsData) ? assessmentsData : []);
        setInvitations(Array.isArray(invitationsData) ? invitationsData : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeAssessments = assessments.filter((a) => a.status === "PUBLISHED");
  const completedAssessments = assessments.filter(
    (a) => a.status === "ARCHIVED"
  );
  const draftAssessments = assessments.filter((a) => a.status === "DRAFT");

  const acceptedInvitations = invitations.filter(
    (inv) => inv.status === "ACCEPTED"
  );

  const stats = [
    {
      label: "Total Assessments",
      value: assessments.length,
      delta: `${activeAssessments.length} active`,
      icon: Trophy,
      tone: "blue",
    },
    {
      label: "Accepted Invitations",
      value: acceptedInvitations.length,
      delta: `${invitations.length} total sent`,
      icon: Users,
      tone: "green",
    },
    {
      label: "Active Assessments",
      value: activeAssessments.length,
      delta: `${completedAssessments.length} completed`,
      icon: Gauge,
      tone: "amber",
    },
    {
      label: "Draft Assessments",
      value: draftAssessments.length,
      delta: "Requires attention",
      icon: ClipboardCheck,
      tone: "red",
    },
  ];

  if (loading) {
    return (
      <div className="recruiter-dashboard">
        <div className="recruiter-toolbar">
          <div className="page-header">
            <div>
              <p className="breadcrumb">Smart Recruiter / Dashboard</p>
              <h1>Recruiter Overview</h1>
            </div>
          </div>
        </div>
        <div className="stat-grid">
          {[1, 2, 3, 4].map((i) => (
            <div className="stat-card stat-card-loading" key={i}>
              <Loader2 className="spin-icon" size={24} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recruiter-dashboard">
        <div className="recruiter-toolbar">
          <div className="page-header">
            <div>
              <p className="breadcrumb">Smart Recruiter / Dashboard</p>
              <h1>Recruiter Overview</h1>
            </div>
          </div>
        </div>
        <div className="stat-grid">
          <div className="stat-card stat-card-error">
            <p>Failed to load dashboard data: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recruiter-dashboard">
      <div className="recruiter-toolbar">
        <div className="page-header">
          <div>
            <p className="breadcrumb">Smart Recruiter / Dashboard</p>
            <h1>Recruiter Overview</h1>
          </div>
          <Link to={ROUTES.RECRUITER.ADD_ASSESSMENT}>
            <Button>
              <Plus size={16} />
              Create Assessment
            </Button>
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <span className={`stat-card-icon stat-icon-${stat.tone}`}>
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

      <div className="dashboard-columns">
        <section className="activity-panel">
          <div className="panel-heading">
            <h2>Recent Assessment Activity</h2>
            <Link to={ROUTES.RECRUITER.RESULTS} className="link-arrow">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {assessments.length === 0 ? (
            <div className="empty-state">
              <p>No assessments created yet. Create your first assessment to get started.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Assessment Name</th>
                    <th>Time Limit</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((row) => (
                    <tr key={row.assessment_id}>
                      <td className="cell-strong">{row.title}</td>
                      <td>{row.time_limit_minutes ? `${row.time_limit_minutes} min` : "N/A"}</td>
                      <td>{formatDate(row.start_date)}</td>
                      <td>{formatDate(row.end_date)}</td>
                      <td>
                        <Badge variant={statusVariant(row.status)}>
                          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="interviews-panel">
          <div className="panel-heading">
            <h2>Upcoming Interviews</h2>
            <CalendarClock size={18} className="panel-heading-icon" />
          </div>

          {acceptedInvitations.length === 0 ? (
            <div className="empty-state">
              <p>No upcoming interviews. Invitations that are accepted will appear here.</p>
            </div>
          ) : (
            <ul className="interview-list">
              {acceptedInvitations.map((inv) => (
                <li className="interview-item" key={inv.id}>
                  <span className="avatar interview-avatar">
                    {inv.interviewee_id ? String(inv.interviewee_id).slice(0, 2).toUpperCase() : "??"}
                  </span>
                  <div className="interview-info">
                    <div className="interview-name">
                      {inv.interviewee_id ? `Candidate #${inv.interviewee_id}` : "Unknown Candidate"}
                      <Badge variant="success">Accepted</Badge>
                    </div>
                    <span className="interview-role">
                      Assessment #{inv.assessment_id}
                    </span>
                    <span className="interview-time">
                      {inv.scheduled_at
                        ? `Scheduled: ${formatDate(inv.scheduled_at)}`
                        : `Accepted: ${formatDate(inv.accepted_at)}`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default RecruiterDashboardPage;
