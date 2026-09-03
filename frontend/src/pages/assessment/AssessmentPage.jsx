import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Flag, Timer } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import {
  assessmentService,
  attemptService,
} from "../../services/assessmentService";
import { ROUTES } from "../../utils/constants";
import "./AssessmentPage.css";

const mapQuestionType = (backendType) => {
  switch ((backendType || "").toLowerCase()) {
    case "multiple_choice":
      return "mcq";
    case "coding":
      return "coding";
    case "whiteboard":
      return "whiteboard";
    case "subjective":
    case "free_text":
    case "text":
    default:
      return "text";
  }
};

const parseOptions = (question) => {
  if (Array.isArray(question?.options) && question.options.length > 0) {
    return question.options;
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
  const [finalScore, setFinalScore] = useState(null);
  const [startError, setStartError] = useState(null);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const [questions, setQuestions] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [attemptInfo, setAttemptInfo] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const assessData = await assessmentService.getAssessment(id);
        setAssessment(assessData);
        setQuestions(Array.isArray(assessData.questions) ? assessData.questions : []);
        if (assessData.time_limit_minutes) {
          setTimeLeft(assessData.time_limit_minutes * 60);
        }
        const status = await attemptService
          .getAttemptStatus(id)
          .catch(() => null);
        if (status) setAttemptInfo(status);
      } catch (err) {
        setError(err.message || "Failed to load assessment");
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

  useEffect(() => {
    if (!started || submitted || timeLeft > 0) return;
    if (attemptId) {
      attemptService
        .submitAttempt(attemptId)
        .then((result) => setFinalScore(result?.score ?? null))
        .catch(() => {})
        .finally(() => setSubmitted(true));
    } else {
      const timer = setTimeout(() => setSubmitted(true), 0);
      return () => clearTimeout(timer);
    }
  }, [started, submitted, timeLeft, attemptId]);

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
  const currentAnswerObj = question ? (answers[question.id] || {}) : {};
  const currentAnswer = currentAnswerObj.value || "";

  const persistAnswer = async (questionId, payload) => {
    if (!attemptId) return;
    try {
      await attemptService.saveAnswer(attemptId, payload);
    } catch {
      // ignore transient save errors
    }
  };

  const updateAnswer = (value) => {
    if (submitted || timeLeft <= 0 || !question) return;
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [question.id]: {
        value,
        type: question.type,
        optionId: question.type === "mcq" ? getOptionId(value) : null,
      },
    }));
    if (question.type === "mcq") {
      const optionId = getOptionId(value);
      persistAnswer(question.id, { question_id: question.id, selected_option_id: optionId });
    } else if (question.type === "text") {
      persistAnswer(question.id, { question_id: question.id, answer_text: value });
    } else {
      persistAnswer(question.id, {
        question_id: question.id,
        code_submission: value,
        programming_language: question.language || "javascript",
      });
    }
  };

  const getOptionId = (optionText) => {
    const option = question?.options.find((o) => o.option_text === optionText);
    return option ? option.option_id : null;
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

  const confirmSubmit = async () => {
    setShowSubmitConfirmation(false);
    if (!attemptId) {
      setSubmitted(true);
      return;
    }
    try {
      const result = await attemptService.submitAttempt(attemptId);
      setFinalScore(result?.score ?? null);
    } catch {
      // proceed to completion screen regardless
    }
    setSubmitted(true);
  };

  const handleStart = async () => {
    try {
      setStartError(null);

      const typeMap = {
        MULTIPLE_CHOICE: "mcq",
        multiple_choice: "mcq",
        CODING: "coding",
        coding: "coding",
        WHITEBOARD: "whiteboard",
        whiteboard: "whiteboard",
        SUBJECTIVE: "text",
        subjective: "text",
        FREE_TEXT: "text",
        text: "text",
      };
      const isWhiteboardAssessment = (assessment?.questions || []).some(
        (q) =>
          typeMap[q.question_type] === "coding" ||
          typeMap[q.question_type] === "whiteboard"
      );

      if (isWhiteboardAssessment) {
        navigate(ROUTES.WHITEBOARD_ASSESSMENT.replace(":assessmentId", id));
        return;
      }

      const attempt = await attemptService.startAttempt(id);
      setAttemptId(attempt?.id ?? attempt?.attempt_id ?? null);
      if (typeof attempt?.remaining_seconds === "number") {
        setTimeLeft(attempt.remaining_seconds);
      }
      try {
        const questionsData = await attemptService.getQuestions(id);
        if (Array.isArray(questionsData) && questionsData.length > 0) {
          setQuestions(questionsData);
        }
      } catch {
        // keep preloaded questions if the attempt-questions fetch fails
      }
      setStarted(true);
    } catch (err) {
      setStartError(err.message || "Failed to start the assessment");
    }
  };

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

  if (started && mappedQuestions.length === 0) {
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

  if (!started && attemptInfo?.locked && !attemptInfo?.active) {
    return (
      <div className="assessment-page assessment-center">
        <Card padded className="assessment-intro-card">
          <Badge variant="success">Completed</Badge>
          <h1>Assessment already submitted</h1>
          <p>
            You have used all of your {attemptInfo.max_attempts} attempt
            {attemptInfo.max_attempts === 1 ? "" : "s"} for this assessment. It is
            now locked for further attempts.
          </p>
          <Button onClick={() => navigate("/interviewee/results")}>
            View My Results
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
              <div><strong>{new Set(mappedQuestions.map((q) => q.type)).size}</strong><span>Question types</span></div>
            </div>

            <Button size="lg" onClick={handleStart}>
              Start Assessment
            </Button>
            {startError && (
              <p style={{ color: "#c00", marginTop: "1rem" }}>{startError}</p>
            )}
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
          {typeof finalScore === "number" && (
            <div className="assessment-submission-summary">
              <div><strong>{Math.round(finalScore)}%</strong><span>Final Score</span></div>
            </div>
          )}
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
            </div>

            <h2 className="question-title">{question.title}</h2>

            {question.type !== "mcq" && (
              <p className="question-prompt">{question.question}</p>
            )}

            {question.type === "mcq" && (
              <>
                {question.question && question.question !== question.title && (
                  <p className="question-prompt">{question.question}</p>
                )}
                {question.options.length > 0 ? (
                  <div className="answer-options">
                    {question.options.map((option, index) => (
                      <label
                        key={option.option_id ?? option.option_text}
                        className={`answer-option ${
                          currentAnswerObj.optionId === option.option_id ? "selected" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.option_text}
                          checked={currentAnswerObj.optionId === option.option_id}
                          onChange={() => updateAnswer(option.option_text)}
                        />
                        <span className="option-marker">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option.option_text}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="question-prompt">
                    No answer options are available for this question.
                  </p>
                )}
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
