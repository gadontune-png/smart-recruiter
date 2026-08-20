import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, Info, Award } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import "./TrialAssessmentPage.css";

const TRIAL_QUESTIONS = [
  {
    id: 1,
    type: "mcq",
    question:
      "Which of the following describes the correct behavior of the React 'useEffect' cleanup function?",
    options: [
      "It runs exactly once when the component mounts onto the virtual DOM root.",
      "It executes before the component unmounts, and before re-running the effect on dependency change.",
      "It is used to force re-render asynchronous states when error boundaries trigger.",
      "It runs concurrently on every animation frame calculation tick.",
    ],
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
  const [hint, setHint] = useState(false);

  const question = TRIAL_QUESTIONS[currentQuestion];
  const currentAnswer = answers[question.id] || "";

  const progressPercent = Math.round(
    ((currentQuestion + 1) / TRIAL_QUESTIONS.length) * 100
  );

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

  const handleSkip = () => {
    if (currentQuestion < TRIAL_QUESTIONS.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (!started) {
    return (
      <div className="trial-page">
        <div className="trial-landing">
          <div className="practice-mode-banner">
            <Info size={18} />
            Practice Mode Enabled: This is a trial assessment simulation. Your
            score here does not affect actual job recruitment.
          </div>

          <Card padded className="trial-landing-card">
            <div className="trial-landing-top">
              <Badge variant="info">
                <Award size={14} />
                Trial Assessment
              </Badge>
              <span>10 questions · ~30 mins</span>
            </div>
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
          </Card>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="trial-page">
        <Card padded className="trial-complete">
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
            <Button onClick={() => navigate("/interviewee/practice")}>
              Back to Practice
            </Button>

            <Button
              variant="secondary"
              onClick={() => navigate("/interviewee/dashboard")}
            >
              Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="trial-page">
      <div className="practice-mode-banner">
        <Info size={18} />
        Practice Mode Enabled: This is a trial assessment simulation. Your score
        here does not affect actual job recruitment.
      </div>

      <div className="trial-progress-panel">
        <div className="progress-panel-top">
          <div>
            <span className="progress-label">Question Progress</span>
            <strong>
              {currentQuestion + 1} of {TRIAL_QUESTIONS.length}
            </strong>
          </div>
          <div className="progress-timer">
            <span className="progress-label">Time Remaining</span>
            <strong>12:45</strong>
          </div>
          <Button variant="outline" size="sm" onClick={() => setHint((value) => !value)}>
            <Lightbulb size={16} />
            Show Hint
          </Button>
        </div>
        <div className="trial-progress">
          <div
            className="trial-progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="progress-percent">{progressPercent}% Complete</span>
        {hint && <p className="trial-hint">Hint: Think carefully about when cleanup callbacks run in React's effect lifecycle.</p>}
      </div>

      <Card padded className="trial-question-card">
        <Badge variant="info" className="question-type-badge">
          {question.type === "mcq"
            ? "Multiple Choice Question"
            : question.type === "text"
              ? "Free Text Question"
              : "Coding Question"}
        </Badge>

        <h2 className="trial-question-text">{question.question}</h2>

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
                <span className="option-marker" aria-hidden="true">
                  {String.fromCharCode(65 + question.options.indexOf(option))}
                </span>
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

          <Button variant="ghost" onClick={handleSkip}>
            Skip Question
          </Button>

          {currentQuestion === TRIAL_QUESTIONS.length - 1 ? (
            <Button onClick={handleSubmit} disabled={!currentAnswer.trim()}>
              Submit Practice
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!currentAnswer.trim()}>
              Next Question
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export default TrialAssessmentPage;