import { useState, useEffect } from "react";
import { Send, Save } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { API_URL } from "../../utils/constants";
import "./recruiter.css";
import "./recruiter-grading.css";

function RecruiterGradingPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [autoRelease, setAutoRelease] = useState(false);
  const [notes, setNotes] = useState("");
  const [score, setScore] = useState("0");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem("sr_auth");
        const headers = { "Content-Type": "application/json" };
        if (token) {
          try {
            const parsed = JSON.parse(token);
            if (parsed.token) headers["Authorization"] = `Bearer ${parsed.token}`;
          } catch {}
        }

        const assessmentsRes = await fetch(`${API_URL}/assessments/my`, { headers });
        const assessments = assessmentsRes.ok ? await assessmentsRes.json() : [];

        const results = [];
        for (const assessment of assessments) {
          if (assessment.status !== "PUBLISHED") continue;
          try {
            const res = await fetch(`${API_URL}/assessments/${assessment.assessment_id}/results`, { headers });
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data)) {
                for (const r of data) {
                  results.push({
                    id: r.id,
                    assessment_id: r.assessment_id,
                    interviewee_id: r.interviewee_id,
                    total_score: r.total_score,
                    grade_released: r.grade_released,
                    calculated_at: r.calculated_at,
                    assessment_title: assessment.title,
                  });
                }
              }
            }
          } catch {}
        }

        if (cancelled) return;
        setCandidates(results);
        if (results.length > 0) {
          setSelected(results[0]);
          setScore(String(results[0].total_score ?? 0));
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load grading data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function handleSelect(candidate) {
    setSelected(candidate);
    setScore(String(candidate.total_score ?? 0));
    setNotes("");
  }

  if (loading) {
    return (
      <div className="recruiter-grading">
        <div className="page-header">
          <p className="breadcrumb">Smart Recruiter / Results / Feedback &amp; Release</p>
          <h1>Direct Candidate Grading Panel</h1>
        </div>
        <p style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Loading grading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recruiter-grading">
        <div className="page-header">
          <p className="breadcrumb">Smart Recruiter / Results / Feedback &amp; Release</p>
          <h1>Direct Candidate Grading Panel</h1>
        </div>
        <p style={{ padding: "2rem", textAlign: "center", color: "#c00" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="recruiter-grading">
      <div className="page-header">
        <p className="breadcrumb">Smart Recruiter / Results / Feedback &amp; Release</p>
        <h1>Direct Candidate Grading Panel</h1>
      </div>

      <div className="grading-columns">
        <section className="panel">
          <div className="panel-heading">
            <h2>Candidates Needing Review</h2>
          </div>
          {candidates.length === 0 ? (
            <p style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
              No candidates to review. Results will appear here once submissions are graded.
            </p>
          ) : (
            <ul className="candidate-list">
              {candidates.map((candidate) => (
                <li key={candidate.id}>
                  <button
                    type="button"
                    className={`candidate-item ${selected?.id === candidate.id ? "active" : ""}`}
                    onClick={() => handleSelect(candidate)}
                  >
                    <div className="candidate-main">
                      <span className="avatar">
                        {String(candidate.interviewee_id).slice(0, 2).toUpperCase()}
                      </span>
                      <div className="candidate-info">
                        <strong>Candidate #{candidate.interviewee_id}</strong>
                        <span>{candidate.assessment_title}</span>
                        <span className="candidate-score">Score: {candidate.total_score ?? "N/A"}</span>
                      </div>
                    </div>
                    <Badge variant={candidate.grade_released ? "success" : "warning"}>
                      {candidate.grade_released ? "Released" : "Pending"}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading evaluation-heading">
            <div>
              <h2>{selected ? `Evaluating: Candidate #${selected.interviewee_id}` : "No Candidate Selected"}</h2>
              <p className="evaluation-assessment">
                {selected
                  ? `Assessment: ${selected.assessment_title}`
                  : "Select a candidate from the list"}
              </p>
            </div>
            <label className="auto-release">
              <input
                type="checkbox"
                checked={autoRelease}
                onChange={(event) => setAutoRelease(event.target.checked)}
              />
              <span>Auto-release Grades</span>
            </label>
          </div>

          <div className="panel-body">
            {selected ? (
              <>
                <div className="question-metric">
                  <div className="metric-head">
                    <strong>Submission Result</strong>
                    <Badge variant="info">Score: {selected.total_score ?? "N/A"}</Badge>
                  </div>
                  <p className="metric-answer">
                    Calculated at: {selected.calculated_at ? new Date(selected.calculated_at).toLocaleString() : "N/A"}
                  </p>
                </div>

                <div className="grading-row">
                  <div className="grading-notes">
                    <label className="form-field-label" htmlFor="feedback-notes">
                      Recruiter Evaluation &amp; Feedback Notes
                    </label>
                    <textarea
                      id="feedback-notes"
                      className="textarea grading-textarea"
                      rows={5}
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                    />
                  </div>

                  <div className="grading-score">
                    <label className="form-field-label" htmlFor="final-score">
                      Review Final Score (%)
                    </label>
                    <input
                      id="final-score"
                      className="input score-input"
                      type="number"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(event) => setScore(event.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : (
              <p style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
                Select a candidate to view details.
              </p>
            )}

            <div className="grading-actions">
              <Button disabled={!selected}>
                <Send size={16} />
                Release Results to Candidate
              </Button>
              <Button variant="secondary" disabled={!selected}>
                <Save size={16} />
                Save Evaluation Draft
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default RecruiterGradingPage;
