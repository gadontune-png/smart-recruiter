import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import "./interviewee-results.css";

const RESULTS = [
  {
    id: 1,
    title: "JavaScript Assessment",
    date: "August 17, 2026",
    score: 100,
    percentage: 100,
    grade: "A",
    status: "Passed",
    released: true,
    feedbackRead: false,
    questions: [
      {
        question: "Which React hook is used to manage component state?",
        answer: "useState",
        correctAnswer: "useState",
        correct: true,
        feedback: "Excellent understanding of React state management.",
      },
      {
        question: "What does CSS primarily control?",
        answer: "The appearance and layout of a webpage",
        correctAnswer: "The appearance and layout of a webpage",
        correct: true,
        feedback: "Correct. You clearly understand the role of CSS.",
      },
    ],
    mentorFeedback:
      "Excellent work. You demonstrated a strong understanding of JavaScript and React fundamentals. Keep building on this foundation by practicing more advanced state management and API integration.",
    feedbackTimestamp: "August 18, 2026 at 10:30 AM",
  },
  {
    id: 2,
    title: "Frontend Development Assessment",
    date: "August 12, 2026",
    score: 78,
    percentage: 78,
    grade: "B+",
    status: "Passed",
    released: true,
    feedbackRead: true,
    questions: [
      {
        question: "Which HTTP method is commonly used to retrieve data?",
        answer: "GET",
        correctAnswer: "GET",
        correct: true,
        feedback: "Correct answer.",
      },
      {
        question: "What is the purpose of React components?",
        answer: "To create reusable UI elements",
        correctAnswer: "To create reusable UI elements",
        correct: true,
        feedback: "Good understanding of reusable components.",
      },
    ],
    mentorFeedback:
      "Good performance overall. Spend more time practicing complex frontend patterns and component architecture.",
    feedbackTimestamp: "August 13, 2026 at 2:15 PM",
  },
  {
    id: 3,
    title: "HTML & CSS Assessment",
    date: "August 8, 2026",
    score: 92,
    percentage: 92,
    grade: "A",
    status: "Passed",
    released: false,
    feedbackRead: false,
    questions: [],
    mentorFeedback: "",
    feedbackTimestamp: "",
  },
];

function IntervieweeResultsPage() {
  const navigate = useNavigate();

  const [selectedResult, setSelectedResult] = useState(RESULTS[0]);
  const [feedbackRead, setFeedbackRead] = useState(
    RESULTS[0].feedbackRead
  );

  const releasedResults = RESULTS.filter((result) => result.released);
  const passedResults = RESULTS.filter(
    (result) => result.status === "Passed"
  );

  const averageScore =
    RESULTS.reduce((total, result) => total + result.score, 0) /
    RESULTS.length;

  const handleSelectResult = (result) => {
    setSelectedResult(result);
    setFeedbackRead(result.feedbackRead);
  };

  const handleMarkFeedbackRead = () => {
    setFeedbackRead(true);
  };

  return (
    <div className="interviewee-results">
      <div className="results-header">
        <div>
          <p className="results-label">Interviewee Portal</p>
          <h1>Results & Feedback</h1>
          <p>
            Review your assessment performance and feedback from mentors.
          </p>
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
          <strong>{RESULTS.length}</strong>
        </Card>

        <Card padded>
          <span>Average Score</span>
          <strong>{Math.round(averageScore)}%</strong>
        </Card>

        <Card padded>
          <span>Assessments Passed</span>
          <strong>{passedResults.length}</strong>
        </Card>

        <Card padded>
          <span>Grades Released</span>
          <strong>{releasedResults.length}</strong>
        </Card>
      </div>

      <div className="results-content">
        <section className="results-list">
          <div className="section-heading">
            <div>
              <h2>Assessment Results</h2>
              <p>Select an assessment to view its details.</p>
            </div>
          </div>

          {RESULTS.map((result) => (
            <Card key={result.id} padded>
              <button
                type="button"
                className={`result-card ${
                  selectedResult.id === result.id ? "selected" : ""
                }`}
                onClick={() => handleSelectResult(result)}
              >
                <div className="result-card-main">
                  <div>
                    <h3>{result.title}</h3>
                    <p>Completed {result.date}</p>
                  </div>

                  <div className="result-card-score">
                    <strong>{result.percentage}%</strong>
                    <span>Grade {result.grade}</span>
                  </div>

                  <Badge
                    variant={result.released ? "success" : "warning"}
                  >
                    {result.released ? result.status : "Grade Pending"}
                  </Badge>
                </div>
              </button>
            </Card>
          ))}
        </section>

        <section className="result-details">
          <Card padded>
            <div className="details-header">
              <div>
                <p className="results-label">Assessment Details</p>
                <h2>{selectedResult.title}</h2>
                <p>Completed {selectedResult.date}</p>
              </div>

              <Badge
                variant={
                  selectedResult.released ? "success" : "warning"
                }
              >
                {selectedResult.released
                  ? selectedResult.status
                  : "Grade Pending"}
              </Badge>
            </div>

            {selectedResult.released ? (
              <>
                <div className="score-display">
                  <div>
                    <span>Score</span>
                    <strong>{selectedResult.score}</strong>
                    <small>out of 100</small>
                  </div>

                  <div>
                    <span>Percentage</span>
                    <strong>{selectedResult.percentage}%</strong>
                  </div>

                  <div>
                    <span>Grade</span>
                    <strong>{selectedResult.grade}</strong>
                  </div>
                </div>

                <div className="completion-status">
                  <Badge variant="success">Completed</Badge>
                  <span>
                    Your grade has been released and is available to view.
                  </span>
                </div>

                {selectedResult.questions.length > 0 && (
                  <div className="question-results">
                    <h3>Question Results</h3>

                    {selectedResult.questions.map((item, index) => (
                      <div
                        className="question-result"
                        key={`${selectedResult.id}-${index}`}
                      >
                        <div className="question-result-header">
                          <strong>Question {index + 1}</strong>

                          <Badge
                            variant={item.correct ? "success" : "danger"}
                          >
                            {item.correct ? "Correct" : "Incorrect"}
                          </Badge>
                        </div>

                        <p className="question-text">
                          {item.question}
                        </p>

                        <div className="answer-box">
                          <span>Your answer</span>
                          <strong>{item.answer}</strong>
                        </div>

                        {!item.correct && (
                          <div className="answer-box">
                            <span>Correct answer</span>
                            <strong>{item.correctAnswer}</strong>
                          </div>
                        )}

                        <p className="question-feedback">
                          {item.feedback}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="feedback-section">
                  <div className="feedback-heading">
                    <div>
                      <h3>Mentor Feedback</h3>
                      {selectedResult.feedbackTimestamp && (
                        <span>
                          {selectedResult.feedbackTimestamp}
                        </span>
                      )}
                    </div>

                    {!feedbackRead && (
                      <Badge variant="info">Unread</Badge>
                    )}
                  </div>

                  {selectedResult.mentorFeedback ? (
                    <>
                      <div
                        className={`mentor-feedback ${
                          !feedbackRead ? "unread" : ""
                        }`}
                      >
                        <Badge variant="info">Mentor Feedback</Badge>

                        <p>{selectedResult.mentorFeedback}</p>
                      </div>

                      {!feedbackRead && (
                        <Button
                          variant="secondary"
                          onClick={handleMarkFeedbackRead}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </>
                  ) : (
                    <EmptyState
                      title="No feedback yet"
                      description="Your mentor has not provided feedback for this assessment."
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="unreleased-state">
                <Badge variant="warning">Grade Not Released</Badge>

                <h3>Your assessment has been completed.</h3>

                <p>
                  Your grade and detailed feedback are still being reviewed.
                  They will appear here once they have been released.
                </p>
              </div>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}

export default IntervieweeResultsPage;