import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Clock, Trophy } from "lucide-react";
import Badge from "../../components/common/Badge";
import { assessmentService, resultService } from "../../services/assessmentService";
import "./recruiter.css";
import "./recruiter-results.css";

function RecruiterResultsPage() {
  const [assessments, setAssessments] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const assessmentsData = await assessmentService.listMyAssessments();

        const allResults = [];
        for (const assessment of assessmentsData) {
          const data = await resultService
            .listAssessmentResults(assessment.assessment_id)
            .catch(() => []);
          if (Array.isArray(data)) {
            for (const r of data) {
              allResults.push({
                ...r,
                assessment_title: assessment.title,
              });
            }
          }
        }

        if (cancelled) return;
        setAssessments(Array.isArray(assessmentsData) ? assessmentsData : []);
        setResults(allResults);
      } catch {
        // silently handle
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const totalSubmissions = results.length;
  const passCount = results.filter((r) => (r.total_score ?? 0) >= 60).length;
  const passRate = totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 0;
  const avgScore = totalSubmissions > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.total_score ?? 0), 0) / totalSubmissions)
    : 0;
  const topScore = totalSubmissions > 0
    ? Math.max(...results.map((r) => r.total_score ?? 0))
    : 0;

  const stats = [
    { label: "Total Assessments", value: String(assessments.length), delta: `${results.length} total results`, icon: BarChart3, tone: "blue" },
    { label: "Pass Rate", value: `${passRate}%`, delta: totalSubmissions > 0 ? `Based on ${totalSubmissions} submissions` : "No data yet", icon: Trophy, tone: "green" },
    { label: "Average Score", value: `${avgScore}%`, delta: totalSubmissions > 0 ? "Across all submissions" : "No data yet", icon: Clock, tone: "amber" },
    { label: "Top Score", value: `${topScore}%`, delta: totalSubmissions > 0 ? "Across all assessments" : "No data yet", icon: TrendingUp, tone: "red" },
  ];

  function buildScoreDistribution() {
    if (results.length === 0) return [];
    const buckets = [
      { label: "<40%", min: 0, max: 40, value: 0 },
      { label: "40-59%", min: 40, max: 60, value: 0 },
      { label: "60-79%", min: 60, max: 80, value: 0 },
      { label: "80-89%", min: 80, max: 90, value: 0 },
      { label: "90-100%", min: 90, max: 101, value: 0 },
    ];
    for (const r of results) {
      const score = r.total_score ?? 0;
      for (const b of buckets) {
        if (score >= b.min && score < b.max) { b.value++; break; }
      }
    }
    const maxVal = Math.max(...buckets.map((b) => b.value), 1);
    return buckets.map((b) => ({ label: b.label, value: Math.round((b.value / maxVal) * 100) }));
  }

  function buildWeeklyData() {
    if (results.length === 0) return [];
    const weekMap = {};
    for (const r of results) {
      if (!r.calculated_at) continue;
      const d = new Date(r.calculated_at);
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
      const key = `Week ${weekNum}`;
      if (!weekMap[key]) weekMap[key] = { volume: 0, completion: 0 };
      weekMap[key].volume++;
      if (r.grade_released) weekMap[key].completion++;
    }
    const entries = Object.entries(weekMap).slice(-4);
    const maxVol = Math.max(...entries.map(([, v]) => v.volume), 1);
    return entries.map(([label, v]) => ({
      label,
      volume: Math.round((v.volume / maxVol) * 100),
      completion: Math.round((v.completion / maxVol) * 100),
    }));
  }

  const scoreDistribution = buildScoreDistribution();
  const weeklyData = buildWeeklyData();

  if (loading) {
    return (
      <div className="recruiter-results">
        <div className="page-header">
          <p className="breadcrumb">Smart Recruiter / Results / Analytics &amp; Stats</p>
          <h1>Operational Statistics</h1>
        </div>
        <p style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Loading results...</p>
      </div>
    );
  }

  return (
    <div className="recruiter-results">
      <div className="page-header">
        <p className="breadcrumb">Smart Recruiter / Results / Analytics &amp; Stats</p>
        <h1>Operational Statistics</h1>
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

      <div className="charts-row">
        <section className="panel chart-card">
          <div className="panel-heading">
            <h2>Score Distribution</h2>
          </div>
          <div className="panel-body">
            {scoreDistribution.length === 0 ? (
              <p style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
                No score data available yet.
              </p>
            ) : (
              <div className="bar-chart">
                {scoreDistribution.map((bar) => (
                  <div className="bar-col" key={bar.label}>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ height: `${bar.value}%` }} />
                    </div>
                    <span className="bar-label">{bar.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="panel chart-card">
          <div className="panel-heading">
            <h2>Weekly Test Volume &amp; Completion Trend</h2>
          </div>
          <div className="panel-body">
            {weeklyData.length === 0 ? (
              <p style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
                No weekly data available yet.
              </p>
            ) : (
              <div className="bar-chart">
                {weeklyData.map((week) => (
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
            )}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <h2>Detailed Candidate Results</h2>
        </div>
        <div className="table-wrap">
          {results.length === 0 ? (
            <p style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
              No candidate results available yet.
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate ID</th>
                  <th>Assessment</th>
                  <th>Score</th>
                  <th>Calculated At</th>
                  <th>Status</th>
                  <th>Grade Released</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id}>
                    <td className="cell-strong">
                      {r.interviewee_name || `Candidate #${r.interviewee_id}`}
                    </td>
                    <td>{r.assessment_title}</td>
                    <td className="cell-score">{r.total_score ?? "N/A"}%</td>
                    <td>{r.calculated_at ? new Date(r.calculated_at).toLocaleDateString() : "N/A"}</td>
                    <td>
                      <Badge variant={(r.total_score ?? 0) >= 60 ? "success" : "danger"}>
                        {(r.total_score ?? 0) >= 60 ? "Pass" : "Fail"}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={r.grade_released ? "success" : "warning"}>
                        {r.grade_released ? "Released" : "Pending"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default RecruiterResultsPage;
