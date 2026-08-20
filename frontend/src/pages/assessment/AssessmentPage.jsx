import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import "./AssessmentPage.css";

const QUESTIONS = [
  {
    id: 1,
    question: "Which of the following is used to create a React component?",
    options: [
      "A JavaScript function",
      "A CSS class",
      "A database query",
      "An HTML document",
    ],
  },
  {
    id: 2,
    question: "Which React hook is commonly used to manage component state?",
    options: [
      "useEffect",
      "useState",
      "useNavigate",
      "useParams",
    ],
  },
  {
    id: 3,
    question: "What does CSS primarily control?",
    options: [
      "Database storage",
      "Server authentication",
      "The appearance and layout of a webpage",
      "API requests",
    ],
  },
  {
    id: 4,
    question: "Which HTTP method is commonly used to retrieve data?",
    options: [
      "POST",
      "DELETE",
      "PATCH",
      "GET",
    ],
  },
  {
    id: 5,
    question: "What does JSX allow you to write inside JavaScript?",
    options: [
      "SQL queries",
      "HTML-like markup",
      "Python code",
      "Database schemas",
    ],
  },
];

function AssessmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const question = QUESTIONS[currentQuestion];
  const selectedAnswer = answers[question.id];

  useEffect(() => {
  if (submitted) {
    return;
  }

  if (timeLeft <= 0) {
    return;
  }

  const timer = setInterval(() => {
    setTimeLeft((previousTime) => previousTime - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [timeLeft, submitted]);

const minutes = Math.floor(timeLeft / 60);
const seconds = timeLeft % 60;

const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const handleAnswer = (answer) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [question.id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="assessment-page">
        <Card padded>
          <div className="assessment-complete">
            <Badge variant="success">Submitted</Badge>

            <h1>Assessment submitted!</h1>

            <p>
              Your answers have been submitted successfully. Your results will
              be available once they have been reviewed.
            </p>

            <Button onClick={() => navigate("/interviewee/results")}>
              View Results
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="assessment-page">
      <div className="assessment-header">
        <div>
          <p className="assessment-label">Assessment #{id}</p>
          <h1>Frontend Developer Assessment</h1>
          <p>
            Answer each question and submit your assessment when finished.
          </p>
        </div>

        <div className="assessment-header-info">
  <Badge variant="info">
    Question {currentQuestion + 1} of {QUESTIONS.length}
  </Badge>

  <Badge variant={timeLeft <= 300 ? "danger" : "warning"}>
    Time left: {formattedTime}
  </Badge>
</div>
</div>
      <div className="assessment-progress">
        <div
          className="assessment-progress-bar"
          style={{
            width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%`,
          }}
        />
      </div>

      <Card padded>
        <div className="question-header">
          Question {currentQuestion + 1}
        </div>

        <h2>{question.question}</h2>

        <div className="answer-options">
          {question.options.map((option) => (
            <label
              key={option}
              className={`answer-option ${
                selectedAnswer === option ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={selectedAnswer === option}
                onChange={() => handleAnswer(option)}
              />

              <span>{option}</span>
            </label>
          ))}
        </div>

        <div className="assessment-actions">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          {currentQuestion === QUESTIONS.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
            >
              Submit Assessment
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!selectedAnswer}
            >
              Next Question
            </Button>
          )}
        </div>
      </Card>

      <div className="question-navigation">
        <h3>Questions</h3>

        <div className="question-numbers">
          {QUESTIONS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`question-number ${
                index === currentQuestion ? "active" : ""
              } ${answers[item.id] ? "answered" : ""}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AssessmentPage;