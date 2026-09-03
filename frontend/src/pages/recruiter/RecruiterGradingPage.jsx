import { useState, useEffect } from "react";
import { Send, Save } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import {
  assessmentService,
  resultService,
} from "../../services/assessmentService";
import { request } from "../../services/apiClient";
import { useToast } from "../../components/common/Toast";
import "./recruiter.css";
import "./recruiter-grading.css";

function RecruiterGradingPage() {
  const toast = useToast();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [autoRelease, setAutoRelease] = useState(false);
  const [notes, setNotes] = useState("");
  const [score, setScore] = useState("0");
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const assessments = await assessmentService.listMyAssessments();

        const results = [];
        for (const assessment of assessments) {
          if (assessment.status !== "PUBLISHED") continue;
          const data = await resultService
            .listAssessmentResults(assessment.assessment_id)
            .catch(() => []);
          if (Array.isArray(data)) {
            for (const r of data) {
              results.push({
                id: r.id,
                submission_id: r.submission_id,
                assessment_id: r.assessment_id,
                interviewee_id: r.interviewee_id,
                interviewee_name: r.interviewee_name,
                total_score: r.total_score,
                grade_released: r.grade_released,
                calculated_at: r.calculated_at,
                assessment_title: assessment.title,
              });
            }
          }
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

  async function handleRelease() {
    if (!selected) return;
    if (selected.grade_released) {
      toast.warning("Grades already released for this candidate's assessment.");
      return;
    }
    setReleasing(true);
    try {
      const res = await resultService.releaseGrades(selected.assessment_id);
      setCandidates((current) =>
        current.map((c) =>
          c.assessment_id === selected.assessment_id
            ? { ...c, grade_released: true }
            : c
        )
      );
      setSelected((current) =>
        current ? { ...current, grade_released: true } : current
      );
      const released = res?.released_count ?? 0;
      toast.success(
        released > 0
          ? `Grades released to ${released} candidate(s).`
          : "Grades released successfully."
      );
    } catch (err) {
      toast.error(err.message || "Failed to release grades");
      setError(err.message || "Failed to release grades");
    } finally {
      setReleasing(false);
    }
  }

  async function handleSaveDraft() {
    if (!selected) return;
    try {
      const parsedScore = Number(score);
      const scorePayload = score !== "" && Number.isFinite(parsedScore) ? parsedScore : null;
      await request(`/results/${selected.id}/feedback`, {
        method: "POST",
        body: JSON.stringify({
          comment: notes || "No feedback notes provided.",
          score: scorePayload,
        }),
      });
      toast.success("Feedback saved and sent to the candidate.");
    } catch (err) {
      setError(err.message || "Failed to save evaluation");
    }
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
                        {String(candidate.interviewee_name || candidate.interviewee_id)
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <div className="candidate-info">
                        <strong>
                          {candidate.interviewee_name
                            ? `Candidate ${candidate.interviewee_name}`
                            : `Candidate #${candidate.interviewee_id}`}
                        </strong>
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
              <h2>{selected ? `Evaluating: ${selected.interviewee_name || `Candidate #${selected.interviewee_id}`}` : "No Candidate Selected"}</h2>
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
              <Button
                disabled={!selected || releasing}
                onClick={handleRelease}
                loading={releasing}
              >
                <Send size={16} />
                {selected?.grade_released ? "Grades Released" : releasing ? "Releasing..." : "Release Results to Candidate"}
              </Button>
              <Button variant="secondary" disabled={!selected} onClick={handleSaveDraft}>
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
