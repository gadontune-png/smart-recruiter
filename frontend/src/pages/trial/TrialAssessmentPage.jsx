import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import "./TrialAssessmentPage.css";

const TRIAL_QUESTIONS = [
  {
    id: 1,
    type: "mcq",
    question: "Which language is primarily used to structure web pages?",
    options: ["JavaScript", "HTML", "Python", "SQL"],
    correctAnswer: "HTML",
  },
  {
    id: 2,
    type: "text",
    question: "In your own words, explain what a React component is.",
    placeholder: "Write your answer here...",
  },
  {
    id: 3,
    type: "coding",
    question:
      "Write a JavaScript function called addNumbers that takes two numbers and returns their sum.",
    starterCode: `function addNumbers(a, b) {
  // Write your code here
}`,
  },
];

function TrialAssessmentPage() {
  const navigate = useNavigate();

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const question = TRIAL_QUESTIONS[currentQuestion];
  const currentAnswer = answers[question.id] || "";

  const updateAnswer = (value) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [question.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < TRIAL_QUESTIONS.length - 1) {
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

  if (!started) {
    return (
      <div className="trial-page">
        <Card padded>
          <div className="trial-landing">
            <Badge variant="info">Trial Assessment</Badge>

            <h1>Get familiar with assessments</h1>

            <p>
              This short trial assessment helps you understand how the
              assessment platform works before taking a real assessment.
            </p>

            <div className="trial-instructions">
              <h2>What to expect</h2>

              <ul>
                <li>Multiple-choice questions</li>
                <li>Free-text questions</li>
                <li>A coding question</li>
                <li>Question navigation</li>
                <li>Answer saving</li>
                <li>A short trial timer</li>
              </ul>
            </div>

            <Button size="lg" onClick={() => setStarted(true)}>
              Start Trial
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="trial-page">
        <Card padded>
          <div className="trial-complete">
            <Badge variant="success">Completed</Badge>

            <h1>Trial completed!</h1>

            <p>
              Great job! You have completed the trial assessment and are now
              familiar with the assessment experience.
            </p>

            <div className="trial-result">
              <strong>{Object.keys(answers).length}</strong>
              <span>questions answered</span>
            </div>

            <div className="trial-complete-actions">
              <Button onClick={() => navigate("/interviewee/assessments")}>
                Back to Assessments
              </Button>

              <Button
                variant="secondary"
                onClick={() => navigate("/interviewee/dashboard")}
              >
                Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="trial-page">
      <div className="trial-header">
        <div>
          <p className="trial-label">Trial Assessment</p>
          <h1>Practice Assessment</h1>
          <p>Question {currentQuestion + 1} of {TRIAL_QUESTIONS.length}</p>
        </div>

        <Badge variant="warning">Trial Mode</Badge>
      </div>

      <div className="trial-progress">
        <div
          className="trial-progress-bar"
          style={{
            width: `${((currentQuestion + 1) / TRIAL_QUESTIONS.length) * 100}%`,
          }}
        />
      </div>

      <Card padded>
        <div className="trial-question-header">
          <Badge variant="info">
            {question.type === "mcq"
              ? "Multiple Choice"
              : question.type === "text"
                ? "Free Text"
                : "Coding"}
          </Badge>
        </div>

        <h2>{question.question}</h2>

        {question.type === "mcq" && (
          <div className="trial-options">
            {question.options.map((option) => (
              <label
                key={option}
                className={`trial-option ${
                  currentAnswer === option ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name={`trial-question-${question.id}`}
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
            className="trial-textarea"
            value={currentAnswer}
            onChange={(event) => updateAnswer(event.target.value)}
            placeholder={question.placeholder}
            rows={8}
          />
        )}

        {question.type === "coding" && (
          <textarea
            className="trial-code-editor"
            value={currentAnswer || question.starterCode}
            onChange={(event) => updateAnswer(event.target.value)}
            spellCheck="false"
            rows={12}
          />
        )}

        <div className="trial-actions">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          {currentQuestion === TRIAL_QUESTIONS.length - 1 ? (
            <Button onClick={handleSubmit} disabled={!currentAnswer.trim()}>
              Submit Trial
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!currentAnswer.trim()}>
              Next Question
            </Button>
          )}
        </div>
      </Card>

      <div className="trial-navigation">
        <h3>Questions</h3>

        <div className="trial-question-numbers">
          {TRIAL_QUESTIONS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`trial-question-number ${
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

export default TrialAssessmentPage;