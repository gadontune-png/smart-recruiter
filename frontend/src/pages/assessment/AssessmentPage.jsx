import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import "./AssessmentPage.css";

const QUESTIONS = [
  {
    id: 1,
    type: "mcq",
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
    type: "text",
    question:
      "Explain in your own words why component state is useful in React.",
    placeholder: "Write your answer here...",
  },
  {
    id: 3,
    type: "mcq",
    question: "Which React hook is commonly used to manage component state?",
    options: [
      "useEffect",
      "useState",
      "useNavigate",
      "useParams",
    ],
  },
  {
    id: 4,
    type: "coding",
    question:
      "Write a JavaScript function called addNumbers that takes two numbers and returns their sum.",
    starterCode: `function addNumbers(a, b) {
  // Write your code here
}`,
  },
  {
    id: 5,
    type: "mcq",
    question: "Which HTTP method is commonly used to retrieve data?",
    options: [
      "POST",
      "DELETE",
      "PATCH",
      "GET",
    ],
  },
];

function AssessmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60);

  const question = QUESTIONS[currentQuestion];
  const currentAnswer = answers[question.id] || "";

  useEffect(() => {
    if (!started || submitted) {
      return undefined;
    }

    if (timeLeft <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setTimeLeft((previousTime) => previousTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, submitted, timeLeft]);

  const updateAnswer = (value) => {
    if (submitted || timeLeft <= 0) {
      return;
    }

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [question.id]: value,
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
    setShowSubmitConfirmation(true);
  };

  const confirmSubmit = () => {
    setShowSubmitConfirmation(false);
    setSubmitted(true);
  };

  const handleStart = () => {
    setStarted(true);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formattedTime = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = QUESTIONS.length - answeredCount;

  if (!started) {
    return (
      <div className="assessment-page">
        <Card padded>
          <div className="assessment-introduction">
            <Badge variant="info">Technical Assessment</Badge>

            <h1>Frontend Developer Assessment</h1>

            <p>
              Welcome to your technical assessment. Read the instructions
              carefully before starting.
            </p>

            <div className="assessment-instructions">
              <h2>Assessment instructions</h2>

              <ul>
                <li>You have 60 minutes to complete the assessment.</li>
                <li>Answer every question before submitting.</li>
                <li>You can move between questions using the navigation.</li>
                <li>Your answers are saved as you work.</li>
                <li>Once submitted, you cannot change your answers.</li>
                <li>The assessment will automatically submit when time runs out.</li>
              </ul>
            </div>

            <div className="assessment-summary">
              <div>
                <strong>{QUESTIONS.length}</strong>
                <span>Questions</span>
              </div>

              <div>
                <strong>60</strong>
                <span>Minutes</span>
              </div>

              <div>
                <strong>3</strong>
                <span>Question types</span>
              </div>
            </div>

            <Button size="lg" onClick={handleStart}>
              Start Assessment
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const assessmentFinished = submitted || timeLeft <= 0;

if (assessmentFinished) {
    return (
      <div className="assessment-page">
        <Card padded>
          <div className="assessment-complete">
            <Badge variant={timeLeft <= 0 ? "warning" : "success"}>
              {timeLeft <= 0 ? "Time Expired" : "Submitted"}
            </Badge>

            <h1>
              {timeLeft <= 0
                ? "Your assessment time has ended"
                : "Assessment submitted!"}
            </h1>

            <p>
              {timeLeft <= 0
                ? "Your assessment was automatically submitted because the timer reached zero."
                : "Your answers have been submitted successfully."}
            </p>

            <div className="assessment-submission-summary">
              <div>
                <strong>{answeredCount}</strong>
                <span>Answered</span>
              </div>

              <div>
                <strong>{unansweredCount}</strong>
                <span>Unanswered</span>
              </div>
            </div>

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
            Complete all questions and submit your assessment before the timer
            ends.
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

      <div className="assessment-status">
        <span>
          <strong>{answeredCount}</strong> answered
        </span>

        <span>
          <strong>{unansweredCount}</strong> unanswered
        </span>
      </div>

      <Card padded>
        <div className="question-header">
          <Badge variant="info">
            {question.type === "mcq"
              ? "Multiple Choice"
              : question.type === "text"
                ? "Free Text"
                : "Coding"}
          </Badge>

          <span>Question {currentQuestion + 1}</span>
        </div>

        <h2>{question.question}</h2>

        {question.type === "mcq" && (
          <div className="answer-options">
            {question.options.map((option) => (
              <label
                key={option}
                className={`answer-option ${
                  currentAnswer === option ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={() => updateAnswer(option)}
                />

                <span>{option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === "text" && (
          <textarea
            className="assessment-textarea"
            value={currentAnswer}
            onChange={(event) => updateAnswer(event.target.value)}
            placeholder={question.placeholder}
            rows={8}
          />
        )}

        {question.type === "coding" && (
          <textarea
            className="assessment-code-editor"
            value={currentAnswer || question.starterCode}
            onChange={(event) => updateAnswer(event.target.value)}
            spellCheck="false"
            rows={12}
          />
        )}

        <div className="answer-saved">
          {currentAnswer ? "✓ Answer saved" : "No answer saved yet"}
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
              disabled={!currentAnswer.trim()}
            >
              Submit Assessment
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!currentAnswer.trim()}
            >
              Save & Next
            </Button>
          )}
        </div>
      </Card>

      <div className="question-navigation">
        <div className="question-navigation-header">
          <h3>Questions</h3>

          <span>
            {answeredCount}/{QUESTIONS.length} answered
          </span>
        </div>

        <div className="question-numbers">
          {QUESTIONS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`question-number ${
                index === currentQuestion ? "active" : ""
              } ${answers[item.id] ? "answered" : "unanswered"}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <div className="question-legend">
          <span>
            <i className="legend-current" />
            Current
          </span>

          <span>
            <i className="legend-answered" />
            Answered
          </span>

          <span>
            <i className="legend-unanswered" />
            Unanswered
          </span>
        </div>
      </div>

      {showSubmitConfirmation && (
        <div className="assessment-modal-backdrop">
          <div className="assessment-modal">
            <Badge variant="warning">Confirm Submission</Badge>

            <h2>Submit your assessment?</h2>

            <p>
              You have answered {answeredCount} of {QUESTIONS.length} questions.
            </p>

            {unansweredCount > 0 && (
              <p>
                You still have {unansweredCount} unanswered question
                {unansweredCount === 1 ? "" : "s"}.
              </p>
            )}

            <div className="assessment-modal-actions">
              <Button
                variant="secondary"
                onClick={() => setShowSubmitConfirmation(false)}
              >
                Continue Assessment
              </Button>

              <Button onClick={confirmSubmit}>
                Submit Assessment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssessmentPage;