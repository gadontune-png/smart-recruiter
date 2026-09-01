import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Flag, Timer } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { API_URL } from "../../utils/constants";
import "./AssessmentPage.css";

const mapQuestionType = (backendType) => {
  switch (backendType) {
    case "multiple_choice":
      return "mcq";
    case "coding":
      return "coding";
    case "text":
    default:
      return "text";
  }
};

const parseOptions = (question) => {
  if (question.options) {
    try {
      const parsed = typeof question.options === "string"
        ? JSON.parse(question.options)
        : question.options;
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === "object") {
        return Object.values(parsed);
      }
    } catch {
      return question.options.split(",").map((o) => o.trim());
    }
  }
  return [];
};

function AssessmentPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const [questions, setQuestions] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [assessRes, questionsRes] = await Promise.all([
          fetch(`${API_URL}/assessments/${id}`),
          fetch(`${API_URL}/assessments/${id}/questions`),
        ]);

        if (!assessRes.ok) throw new Error("Failed to load assessment");
        if (!questionsRes.ok) throw new Error("Failed to load questions");

        const assessData = await assessRes.json();
        const questionsData = await questionsRes.json();

        setAssessment(assessData);
        setQuestions(questionsData);
        if (assessData.time_limit_minutes) {
          setTimeLeft(assessData.time_limit_minutes * 60);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!started || submitted) return undefined;
    if (timeLeft <= 0) return undefined;
    const timer = setInterval(() => {
      setTimeLeft((previousTime) => previousTime - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [started, submitted, timeLeft]);

  const mappedQuestions = questions.map((q) => ({
    id: q.question_id,
    type: mapQuestionType(q.question_type),
    title: q.question_text,
    points: q.points,
    question: q.description || q.question_text,
    starterCode: q.starter_code || "",
    language: q.language || "javascript",
    options: parseOptions(q),
    constraints: [],
    placeholder: "Write your answer here...",
  }));

  const questionCount = mappedQuestions.length;
  const question = mappedQuestions[currentQuestion] || null;
  const currentAnswer = question ? (answers[question.id] || "") : "";

  const updateAnswer = (value) => {
    if (submitted || timeLeft <= 0 || !question) return;
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [question.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questionCount - 1) {
      setCurrentQuestion((previous) => previous + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);
    }
  };

  const toggleFlag = () => {
    if (!question) return;
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

  if (loading) {
    return (
      <div className="assessment-page assessment-center">
        <Card padded className="assessment-intro-card">
          <p>Loading assessment...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assessment-page assessment-center">
        <Card padded className="assessment-intro-card">
          <Badge variant="danger">Error</Badge>
          <h1>Failed to load assessment</h1>
          <p>{error}</p>
          <Button onClick={() => navigate("/interviewee/assessments")}>
            Back to Assessments
          </Button>
        </Card>
      </div>
    );
  }

  if (mappedQuestions.length === 0) {
    return (
      <div className="assessment-page assessment-center">
        <Card padded className="assessment-intro-card">
          <Badge variant="warning">No Questions</Badge>
          <h1>No questions available for this assessment.</h1>
          <Button onClick={() => navigate("/interviewee/assessments")}>
            Back to Assessments
          </Button>
        </Card>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="assessment-page assessment-center">
        <Card padded className="assessment-intro-card">
          <div className="assessment-introduction">
            <Badge variant="info">Technical Assessment</Badge>
            <h1>{assessment?.title || "Assessment"}</h1>
            <p className="assessment-section">{assessment?.description || ""}</p>
            <p>
              Welcome to your technical assessment. Read the instructions
              carefully before starting.
            </p>

            <div className="assessment-instructions">
              <h2>Assessment instructions</h2>
              <ul>
                <li>You have {assessment?.time_limit_minutes || 60} minutes to complete the assessment.</li>
                <li>Answer every question before submitting.</li>
                <li>You can move between questions using the navigator.</li>
                <li>Your answers are saved as you work.</li>
                <li>Once submitted, you cannot change your answers.</li>
              </ul>
            </div>

            <div className="assessment-summary">
              <div><strong>{questionCount}</strong><span>Questions</span></div>
              <div><strong>{assessment?.time_limit_minutes || 60}</strong><span>Minutes</span></div>
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
            <div><strong>{questionCount - answeredCount}</strong><span>Unanswered</span></div>
          </div>
          <Button onClick={() => navigate("/interviewee/results")}>
            View Results
          </Button>
        </Card>
      </div>
    );
  }

  const progressPercent = Math.round(((currentQuestion + 1) / questionCount) * 100);

  return (
    <div className="assessment-page">
      <div className="assessment-topbar">
        <div className="assessment-title">
          <Badge variant="info">{assessment?.title || "Assessment"}</Badge>
          <p>{assessment?.description || ""}</p>
        </div>
        <div className="assessment-tracker">
          <span className="tracker-text">Question {currentQuestion + 1} of {questionCount}</span>
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
                  {question.language || "javascript"}
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
              {currentQuestion === questionCount - 1 ? (
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
              <span><i className="lg unvisited" />Unvisited ({questionCount - visitedCount})</span>
            </div>
            <div className="question-numbers">
              {mappedQuestions.map((item, index) => (
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
              You have answered {answeredCount} of {questionCount} questions.
            </p>
            {questionCount - answeredCount > 0 && (
              <p>
                You still have {questionCount - answeredCount} unanswered question
                {questionCount - answeredCount === 1 ? "" : "s"}.
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
