import { useState } from "react";
import { Send, Save } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import "./recruiter.css";
import "./recruiter-grading.css";

const CANDIDATES = [
  { id: 1, name: "John Doe", status: "Needs Review", role: "Senior React Dev", score: "94%" },
  { id: 2, name: "Alice Smith", status: "Evaluated", role: "Node.js System Design", score: "78%" },
  { id: 3, name: "Bob Johnson", status: "Needs Review", role: "Kubernetes Dev", score: "55%" },
  { id: 4, name: "Clara Oswald", status: "Evaluated", role: "React Frontend Challenge", score: "81%" },
];

const QUESTIONS = [
  {
    title: "Question 1: React Hooks Lifecycle Optimization",
    score: "9/10",
    answer:
      '"I optimized render cycle latency using React.useMemo() for filtering algorithms and properly handled cleanup in useEffect to avoid stale closures."',
  },
  {
    title: "Question 2: State Management Architecture Strategy",
    score: "8/10",
    answer:
      '"Implemented Redux-Toolkit slices with state normalization logic for local UI modules, and used redux-thunk for async side effects."',
  },
];

function RecruiterGradingPage() {
  const [selected, setSelected] = useState(CANDIDATES[0]);
  const [autoRelease, setAutoRelease] = useState(false);
  const [notes, setNotes] = useState(
    "Great overall command of component life cycles and optimizations. Demonstrates mature architectural thinking for state management. Recommend moving forward.",
  );
  const [score, setScore] = useState("94");

  const selectedStatusTone = selected.status === "Evaluated" ? "success" : "warning";

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
          <ul className="candidate-list">
            {CANDIDATES.map((candidate) => (
              <li key={candidate.id}>
                <button
                  type="button"
                  className={`candidate-item ${selected.id === candidate.id ? "active" : ""}`}
                  onClick={() => setSelected(candidate)}
                >
                  <div className="candidate-main">
                    <span className="avatar">{candidate.name.split(" ").map((p) => p[0]).join("")}</span>
                    <div className="candidate-info">
                      <strong>{candidate.name}</strong>
                      <span>{candidate.role}</span>
                      <span className="candidate-score">Assessment Score: {candidate.score}</span>
                    </div>
                  </div>
                  <Badge variant={selectedStatusTone}>{candidate.status}</Badge>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <div className="panel-heading evaluation-heading">
            <div>
              <h2>Evaluating: {selected.name}</h2>
              <p className="evaluation-assessment">
                Assessment: Senior React Developer Challenge{" "}
                <span>(Completed 2 hours ago)</span>
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
            <h3 className="sublabel">Per-Question Metrics &amp; Sandbox Submissions</h3>

            {QUESTIONS.map((question, index) => (
              <div className="question-metric" key={index}>
                <div className="metric-head">
                  <strong>{question.title}</strong>
                  <Badge variant="info">Assessed Score: {question.score}</Badge>
                </div>
                <p className="metric-answer">{question.answer}</p>
              </div>
            ))}

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

            <div className="grading-actions">
              <Button>
                <Send size={16} />
                Release Results to Candidate
              </Button>
              <Button variant="secondary">
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