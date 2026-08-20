import { Link } from "react-router-dom";
import {
  Plus,
  ArrowRight,
  CalendarClock,
  Trophy,
  Users,
  Gauge,
  ClipboardCheck,
} from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { ROUTES } from "../../utils/constants";
import "./recruiter.css";

const STATS = [
  { label: "Total Assessments", value: "24", delta: "+3 this month", icon: Trophy, tone: "blue" },
  { label: "Active Candidates", value: "156", delta: "42 currently testing", icon: Users, tone: "green" },
  { label: "Avg. Test Score", value: "72.4%", delta: "+1.2% variance", icon: Gauge, tone: "amber" },
  { label: "Pending Reviews", value: "8", delta: "Requires evaluation", icon: ClipboardCheck, tone: "red" },
];

const ACTIVITY = [
  { name: "Senior React Developer Challenge", candidates: 42, completed: 31, avg: "78.4%", status: "Active" },
  { name: "Node.js System Design Test", candidates: 28, completed: 19, avg: "69.1%", status: "Completed" },
  { name: "DevOps Kubernetes Assessment", candidates: 15, completed: 15, avg: "82.5%", status: "Active" },
  { name: "Python Junior Intern Assessment", candidates: 65, completed: 58, avg: "71.3%", status: "Draft" },
  { name: "Golang Microservices API", candidates: 12, completed: 3, avg: "88.0%", status: "Active" },
];

const INTERVIEWS = [
  { name: "John Doe", match: 88, role: "React Dev", time: "10:30 AM Today", avatar: "JD" },
  { name: "Alice Smith", match: 74, role: "Node.js Dev", time: "2:00 PM Today", avatar: "AS" },
  { name: "Bob Johnson", match: 92, role: "DevOps Eng", time: "11:15 AM Tomorrow", avatar: "BJ" },
  { name: "Clara Oswald", match: 81, role: "React Dev", time: "3:30 PM Jan 26", avatar: "CO" },
];

function statusVariant(status) {
  if (status === "Active") return "success";
  if (status === "Completed") return "info";
  return "warning";
}

function RecruiterDashboardPage() {
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
        {STATS.map((stat) => (
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

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Assessment Name</th>
                  <th>Candidates</th>
                  <th>Completed</th>
                  <th>Avg. Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVITY.map((row) => (
                  <tr key={row.name}>
                    <td className="cell-strong">{row.name}</td>
                    <td>{row.candidates}</td>
                    <td>{row.completed}</td>
                    <td className="cell-score">{row.avg}</td>
                    <td>
                      <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="interviews-panel">
          <div className="panel-heading">
            <h2>Upcoming Interviews</h2>
            <CalendarClock size={18} className="panel-heading-icon" />
          </div>

          <ul className="interview-list">
            {INTERVIEWS.map((interview) => (
              <li className="interview-item" key={interview.name}>
                <span className="avatar interview-avatar">{interview.avatar}</span>
                <div className="interview-info">
                  <div className="interview-name">
                    {interview.name}
                    <Badge variant="success">{interview.match}% Match</Badge>
                  </div>
                  <span className="interview-role">{interview.role}</span>
                  <span className="interview-time">{interview.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default RecruiterDashboardPage;