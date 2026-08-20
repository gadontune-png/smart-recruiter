import { BarChart3, TrendingUp, Clock, Trophy } from "lucide-react";
import Badge from "../../components/common/Badge";
import "./recruiter.css";
import "./recruiter-results.css";

const STATS = [
  { label: "Total Submissions", value: "342", delta: "+24% from last cohort", icon: BarChart3, tone: "blue" },
  { label: "Pass Rate", value: "68%", delta: "Target baseline: > 65%", icon: Trophy, tone: "green" },
  { label: "Average Duration", value: "45 mins", delta: "+3m variance", icon: Clock, tone: "amber" },
  { label: "Top Score", value: "98%", delta: "Sarah Connor (React Challenge)", icon: TrendingUp, tone: "red" },
];

const SCORE_DISTRIBUTION = [
  { label: "<40%", value: 8 },
  { label: "40-59%", value: 15 },
  { label: "60-79%", value: 32 },
  { label: "80-89%", value: 27 },
  { label: "90-100%", value: 18 },
];

const WEEKLY = [
  { label: "Week 1", volume: 40, completion: 35 },
  { label: "Week 2", volume: 55, completion: 48 },
  { label: "Week 3", volume: 62, completion: 54 },
  { label: "Week 4", volume: 78, completion: 70 },
];

const CANDIDATES = [
  { name: "John Doe", assessment: "Senior React Developer Challenge", score: "94%", time: "38 min", status: "Pass" },
  { name: "Alice Smith", assessment: "Node.js System Design Test", score: "78%", time: "44 min", status: "Pass" },
  { name: "Bob Johnson", assessment: "DevOps Kubernetes Assessment", score: "55%", time: "52 min", status: "Fail" },
];

function RecruiterResultsPage() {
  return (
    <div className="recruiter-results">
      <div className="page-header">
        <p className="breadcrumb">Smart Recruiter / Results / Analytics &amp; Stats</p>
        <h1>Operational Statistics</h1>
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

      <div className="charts-row">
        <section className="panel chart-card">
          <div className="panel-heading">
            <h2>Score Distribution</h2>
          </div>
          <div className="panel-body">
            <div className="bar-chart">
              {SCORE_DISTRIBUTION.map((bar) => (
                <div className="bar-col" key={bar.label}>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ height: `${bar.value}%` }} />
                  </div>
                  <span className="bar-label">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel chart-card">
          <div className="panel-heading">
            <h2>Weekly Test Volume &amp; Completion Trend</h2>
          </div>
          <div className="panel-body">
            <div className="bar-chart">
              {WEEKLY.map((week) => (
                <div className="bar-col" key={week.label}>
                  <div className="week-legend">
                    <i className="legend-vol" /> Volume
                    <i className="legend-comp" /> Completion
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill bar-volume" style={{ height: `${week.volume}%` }} />
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill bar-completion" style={{ height: `${week.completion}%` }} />
                  </div>
                  <span className="bar-label">{week.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <h2>Detailed Candidate Results</h2>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Assessment Title</th>
                <th>Test Score</th>
                <th>Time Spent</th>
                <th>Status</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {CANDIDATES.map((candidate) => (
                <tr key={candidate.name}>
                  <td className="cell-strong">{candidate.name}</td>
                  <td>{candidate.assessment}</td>
                  <td className="cell-score">{candidate.score}</td>
                  <td>{candidate.time}</td>
                  <td>
                    <Badge
                      variant={candidate.status === "Pass" ? "success" : "danger"}
                    >
                      {candidate.status}
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      variant={candidate.status === "Pass" ? "success" : "danger"}
                    >
                      {candidate.status === "Pass" ? "Shortlist" : "Reject"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default RecruiterResultsPage;