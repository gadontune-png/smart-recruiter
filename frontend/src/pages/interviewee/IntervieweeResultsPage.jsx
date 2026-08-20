import { Download } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import "./interviewee-results.css";

const ASSESSMENT = {
  title: "Acme Corp Front-End Evaluation",
  completed: "Completed Oct 24, 2026",
  score: "82%",
  percentile: "Top 12%",
  verdict: "PASSED",
  summary:
    "Excellent performance! You scored higher than 88% of other front-end applicants who completed this challenge series.",
};

const CATEGORIES = [
  { label: "Logic & Algorithm Accuracy", value: 90 },
  { label: "Coding Implementation & Cleanliness", value: 78 },
  { label: "System Design & Performance", value: 75 },
];

const QUESTIONS = [
  {
    key: "01",
    q: "Big-O Complexity Assessment",
    your: "O(n log n)",
    correct: "O(n log n)",
    points: "10 / 10",
    status: "Correct",
  },
  {
    key: "02",
    q: "Array Prototype Manipulation",
    your: "Array.map()",
    correct: "Array.reduce()",
    points: "2 / 10",
    status: "Incorrect",
  },
  {
    key: "03",
    q: "Closures and Scope Blocks",
    your: "Functional Closure",
    correct: "Functional Closure",
    points: "15 / 15",
    status: "Correct",
  },
];

function IntervieweeResultsPage() {
  return (
    <div className="interviewee-results">
      <div className="page-header">
        <p className="breadcrumb">AssessHub / Assessment Report</p>
        <h1>{ASSESSMENT.title}</h1>
        <p className="page-header-desc">{ASSESSMENT.completed}</p>
      </div>

      <div className="results-layout">
        <section className="report-main">
          <div className="panel score-panel">
            <div className="score-circle" style={{ "--score": "82%" }}>
              <div className="score-circle-inner">
                <strong>{ASSESSMENT.score}</strong>
                <span>Score</span>
              </div>
            </div>
            <div className="score-details">
              <Badge variant="success">{ASSESSMENT.verdict}</Badge>
              <h2>Percentile Rank: {ASSESSMENT.percentile}</h2>
              <p>{ASSESSMENT.summary}</p>
              <Button variant="secondary" onClick={() => window.print()}>
                <Download size={16} />
                Download PDF Report
              </Button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <h2>Category Performance Breakdown</h2>
            </div>
            <div className="panel-body category-list">
              {CATEGORIES.map((category) => (
                <div className="category-row" key={category.label}>
                  <div className="category-info">
                    <span>{category.label}</span>
                    <strong>{category.value}%</strong>
                  </div>
                  <div className="category-bar">
                    <div className="category-fill" style={{ width: `${category.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <h2>Detailed Question Evaluation</h2>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Your Answer</th>
                    <th>Correct Answer</th>
                    <th>Points</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {QUESTIONS.map((question) => (
                    <tr key={question.key}>
                      <td className="cell-strong">
                        {question.key}. {question.q}
                      </td>
                      <td>{question.your}</td>
                      <td>{question.correct}</td>
                      <td>{question.points}</td>
                      <td>
                        <Badge variant={question.status === "Correct" ? "success" : "danger"}>
                          {question.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="report-side">
          <div className="panel comments-panel">
            <div className="panel-heading">
              <h2>Recruiter &amp; Reviewer Comments</h2>
            </div>
            <div className="panel-body">
              <div className="comment-head">
                <span className="avatar comment-avatar">SJ</span>
                <div>
                  <strong>Sarah Jenkins</strong>
                  <span>Lead Tech Recruiter · Oct 25, 2026</span>
                </div>
              </div>
              <p className="comment-body">
                &quot;Alex demonstrated high proficiency in raw JS operations. The
                optimization of test case runs was outstanding. Keep deepening
                array-reduction patterns.&quot;
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default IntervieweeResultsPage;