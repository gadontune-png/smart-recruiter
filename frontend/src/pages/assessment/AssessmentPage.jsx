import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, Timer } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import "./AssessmentPage.css";

const QUESTION_COUNT = 20;

function buildQuestions() {
  const questions = [];
  const mcqWordBank = {
    q1: "Which of the following is used to create a React component?",
    q2: "Which React hook is commonly used to manage component state?",
    q4: "Which HTTP method is commonly used to retrieve data?",
  };
  const optionsBank = [
    "A JavaScript function",
    "A CSS class",
    "A database query",
    "An HTML document",
  ];
  for (let i = 1; i <= QUESTION_COUNT; i += 1) {
    if (i === 5) {
      questions.push({
        id: i,
        type: "coding",
        title: "Implement a Deep Merge Function for Nested Objects",
        points: 15,
        question:
          "Write a function deepMerge(obj1, obj2) that recursively merges two JavaScript objects. If a key exists in both objects, merge their nested values recursively.",
        constraints: [
          "Do not use external libraries (like Lodash).",
          "Correctly handle circular references if applicable.",
        ],
        starterCode: `// Write your deepMerge implementation below
function deepMerge(obj1, obj2) {
  const merged = { ...obj1 };
  for (let key in obj2) {
    // Add recursive merging logic here...
  }
  return merged;
}`,
      });
    } else if (i % 5 === 0 || i % 7 === 0) {
      questions.push({
        id: i,
        type: "coding",
        title: `Coding Challenge ${i}`,
        points: 15,
        question: `Implement the function described for challenge ${i}.`,
        starterCode: `function solveChallenge${i}() {
  // Write your solution here
}`,
      });
    } else if (mcqWordBank[`q${i}`]) {
      questions.push({
        id: i,
        type: "mcq",
        title: mcqWordBank[`q${i}`],
        points: 5,
        options: i === 2 ? ["useEffect", "useState", "useNavigate", "useParams"] : optionsBank,
      });
    } else {
      questions.push({
        id: i,
        type: "text",
        title: `Explain in your own words why component state is useful (question ${i}).`,
        points: 10,
        placeholder: "Write your answer here...",
      });
    }
  }
  return questions;
}

const QUESTIONS = buildQuestions();

function AssessmentPage() {
  const navigate = useNavigate();

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(4);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set([6]));
  const [submitted, setSubmitted] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(38 * 60 + 22);

  const question = QUESTIONS[currentQuestion];
  const currentAnswer = answers[question.id] || "";

  useEffect(() => {
    if (!started || submitted) return undefined;
    if (timeLeft <= 0) return undefined;
    const timer = setInterval(() => {
      setTimeLeft((previousTime) => previousTime - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [started, submitted, timeLeft]);

  const updateAnswer = (value) => {
    if (submitted || timeLeft <= 0) return;
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

  const toggleFlag = () => {
    setFlagged((current) => {
      const next = new Set(current);
      if (next.has(question.id)) next.delete(question.id);
      else next.add(question.id);
      return next;
    });
  };

  const handleSubmit = () => setShowSubmitConfirmation(true);
  const confirmSubmit = () => {
    setShowSubmitConfirmation(false);
    setSubmitted(true);
  };
  const handleStart = () => setStarted(true);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flagged.size;
  const visitedCount = new Set([...Object.keys(answers).map(Number), ...flagged, currentQuestion]).size;

  if (!started) {
    return (
      <div className="assessment-page assessment-center">
        <Card padded className="assessment-intro-card">
          <div className="assessment-introduction">
            <Badge variant="info">Technical Assessment</Badge>
            <h1>Acme Corp Front-End Evaluation</h1>
            <p className="assessment-section">Section: Advanced Coding Challenges</p>
            <p>
              Welcome to your technical assessment. Read the instructions
              carefully before starting.
            </p>

            <div className="assessment-instructions">
              <h2>Assessment instructions</h2>
              <ul>
                <li>You have 60 minutes to complete the assessment.</li>
                <li>Answer every question before submitting.</li>
                <li>You can move between questions using the navigator.</li>
                <li>Your answers are saved as you work.</li>
                <li>Once submitted, you cannot change your answers.</li>
              </ul>
            </div>

            <div className="assessment-summary">
              <div><strong>{QUESTION_COUNT}</strong><span>Questions</span></div>
              <div><strong>60</strong><span>Minutes</span></div>
              <div><strong>3</strong><span>Question types</span></div>
            </div>

            <Button size="lg" onClick={handleStart}>
              Start Assessment
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (submitted || timeLeft <= 0) {
    return (
      <div className="assessment-page assessment-center">
        <Card padded className="assessment-complete">
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
            <div><strong>{answeredCount}</strong><span>Answered</span></div>
            <div><strong>{QUESTION_COUNT - answeredCount}</strong><span>Unanswered</span></div>
          </div>
          <Button onClick={() => navigate("/interviewee/results")}>
            View Results
          </Button>
        </Card>
      </div>
    );
  }

  const progressPercent = Math.round(((currentQuestion + 1) / QUESTION_COUNT) * 100);

  return (
    <div className="assessment-page">
      <div className="assessment-topbar">
        <div className="assessment-title">
          <Badge variant="info">Acme Corp Front-End Evaluation</Badge>
          <p>Section: Advanced Coding Challenges</p>
        </div>
        <div className="assessment-tracker">
          <span className="tracker-text">Question {currentQuestion + 1} of {QUESTION_COUNT}</span>
          <span className="tracker-text"> {progressPercent}% Completed</span>
          <span className="tracker-timer">
            <Timer size={16} />
            {formattedTime}
          </span>
        </div>
      </div>

      <div className="assessment-layout">
        <div className="assessment-main">
          <Card padded className="question-card">
            <div className="question-meta-row">
              <Badge variant="primary">
                Question {currentQuestion + 1}
              </Badge>
              <span className="question-points">
                {question.points} Points
              </span>
              <span className="question-estimate">Estimated time: 10 mins</span>
            </div>

            <h2 className="question-title">{question.title}</h2>

            {question.type !== "mcq" && (
              <p className="question-prompt">{question.question}</p>
            )}

            {question.constraints && (
              <div className="question-constraints">
                <strong>Constraints:</strong>
                <ol>
                  {question.constraints.map((constraint) => (
                    <li key={constraint}>{constraint}</li>
                  ))}
                </ol>
              </div>
            )}

            {question.type === "mcq" && (
              <>
                <p className="question-prompt">{question.title}</p>
                <div className="answer-options">
                  {question.options.map((option, index) => (
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
                      <span className="option-marker">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </>
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
              <div className="code-editor-box">
                <div className="code-editor-tab">
                  <span className="file-dot" />
                  deepMerge.js
                </div>
                <textarea
                  className="assessment-code-editor"
                  value={currentAnswer || question.starterCode}
                  onChange={(event) => updateAnswer(event.target.value)}
                  spellCheck="false"
                  rows={14}
                />
              </div>
            )}

            <div className="question-actions">
              <Button variant="secondary" onClick={handlePrevious} disabled={currentQuestion === 0}>
                Previous Question
              </Button>
              <Button variant={flagged.has(question.id) ? "danger" : "outline"} onClick={toggleFlag}>
                <Flag size={16} />
                Flag for Review
              </Button>
              {currentQuestion === QUESTIONS.length - 1 ? (
                <Button onClick={handleSubmit}>Submit Assessment</Button>
              ) : (
                <Button onClick={handleNext}>Next Question</Button>
              )}
            </div>
          </Card>
        </div>

        <aside className="assessment-navigator">
          <Card padded={false} className="navigator-card">
            <div className="navigator-head">
              <h3>Question Navigator</h3>
            </div>
            <div className="navigator-legend">
              <span><i className="lg answered" />Answered ({answeredCount})</span>
              <span><i className="lg current" />Current ({1})</span>
              <span><i className="lg flagged" />Flagged for Review ({flaggedCount})</span>
              <span><i className="lg unvisited" />Unvisited ({QUESTION_COUNT - visitedCount})</span>
            </div>
            <div className="question-numbers">
              {QUESTIONS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`question-number ${index === currentQuestion ? "current" : ""} ${
                    answers[item.id] ? "answered" : ""
                  } ${flagged.has(item.id) ? "flagged" : ""}`}
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </Card>

          <Button size="lg" block className="submit-button" onClick={handleSubmit}>
            Submit Assessment
          </Button>
        </aside>
      </div>

      {showSubmitConfirmation && (
        <div className="assessment-modal-backdrop">
          <div className="assessment-modal">
            <Badge variant="warning">Confirm Submission</Badge>
            <h2>Submit your assessment?</h2>
            <p>
              You have answered {answeredCount} of {QUESTION_COUNT} questions.
            </p>
            {QUESTION_COUNT - answeredCount > 0 && (
              <p>
                You still have {QUESTION_COUNT - answeredCount} unanswered question
                {QUESTION_COUNT - answeredCount === 1 ? "" : "s"}.
              </p>
            )}
            <div className="assessment-modal-actions">
              <Button variant="secondary" onClick={() => setShowSubmitConfirmation(false)}>
                Continue Assessment
              </Button>
              <Button onClick={confirmSubmit}>Submit Assessment</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssessmentPage;