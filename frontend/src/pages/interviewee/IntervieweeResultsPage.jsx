import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import "./interviewee-results.css";

const RESULTS = [
  {
    id: 1,
    title: "JavaScript Assessment",
    date: "August 17, 2026",
    score: 85,
    grade: "A",
    status: "Passed",
  },
  {
    id: 2,
    title: "Frontend Development Assessment",
    date: "August 12, 2026",
    score: 78,
    grade: "B+",
    status: "Passed",
  },
  {
    id: 3,
    title: "HTML & CSS Assessment",
    date: "August 8, 2026",
    score: 92,
    grade: "A",
    status: "Passed",
  },
];

function IntervieweeResultsPage() {
  const navigate = useNavigate();

  return (
    <div className="interviewee-results">
      <div className="results-header">
        <div>
          <h1>Results & Feedback</h1>
          <p>Review your completed assessments and performance.</p>
        </div>

        <Button
          variant="secondary"
          onClick={() => navigate("/interviewee/assessments")}
        >
          View Assessments
        </Button>
      </div>

      <div className="results-summary">
        <Card padded>
          <span>Assessments Completed</span>
          <strong>3</strong>
        </Card>

        <Card padded>
          <span>Average Score</span>
          <strong>85%</strong>
        </Card>

        <Card padded>
          <span>Assessments Passed</span>
          <strong>3</strong>
        </Card>
      </div>

      <div className="results-list">
        <h2>Assessment Results</h2>

        {RESULTS.map((result) => (
          <Card key={result.id} padded>
            <div className="result-row">
              <div>
                <h3>{result.title}</h3>
                <p>Completed {result.date}</p>
              </div>

              <div className="result-score">
                <strong>{result.score}%</strong>
                <span>Grade {result.grade}</span>
              </div>

              <Badge variant="success">{result.status}</Badge>
            </div>
          </Card>
        ))}
      </div>

      <div className="feedback-section">
        <h2>Feedback</h2>

        <Card padded>
          <h3>JavaScript Assessment</h3>

          <p>
            Good understanding of JavaScript fundamentals and React concepts.
            Continue practicing more advanced state management and API
            integration.
          </p>

          <Badge variant="info">Mentor Feedback</Badge>
        </Card>
      </div>
    </div>
  );
}

export default IntervieweeResultsPage;