import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, Info, Award } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import {
  assessmentService,
  questionService,
} from "../../services/assessmentService";
import "./TrialAssessmentPage.css";

function TrialAssessmentPage() {
  const navigate = useNavigate();

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [hint, setHint] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    async function loadTrialAssessment() {
      try {
        setLoading(true);
        const assessments = await assessmentService.listAssessments();
        const published = Array.isArray(assessments)
          ? assessments.find((a) => a.status === "PUBLISHED")
          : null;
        if (!published) return;

        setAssessment(published);

        const qData = await questionService.listQuestions(published.assessment_id);
        setQuestions(Array.isArray(qData) ? qData : []);

        if (published.time_limit_minutes) {
          setTimeLeft(published.time_limit_minutes * 60);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    loadTrialAssessment();
  }, []);

  useEffect(() => {
    if (!started || submitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, submitted, timeLeft]);

  const question = questions[currentQuestion] || null;
  const currentAnswer = question ? (answers[question.question_id] || "") : "";
  const questionCount = questions.length;

  const progressPercent = questionCount > 0
    ? Math.round(((currentQuestion + 1) / questionCount) * 100)
    : 0;

  const updateAnswer = (value) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [question.question_id]: value,
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

  const handleSkip = () => {
    if (currentQuestion < questionCount - 1) {
      setCurrentQuestion((previous) => previous + 1);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="trial-page">
        <div className="trial-landing">
          <Card padded className="trial-landing-card">
            <p>Loading trial assessment...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="trial-page">
        <div className="trial-landing">
          <div className="practice-mode-banner">
            <Info size={18} />
            Practice Mode Enabled: This is a trial assessment simulation. Your
            score here does not affect actual job recruitment.
          </div>
          <Card padded className="trial-landing-card">
            <h1>No trial assessments available</h1>
            <p>There are currently no published trial assessments. Check back later.</p>
            <Button onClick={() => navigate("/interviewee/dashboard")}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

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
              <span>{questionCount} question{questionCount !== 1 ? "s" : ""} · {assessment?.time_limit_minutes || "N/A"} mins</span>
            </div>
            <h1>{assessment?.title || "Get familiar with assessments"}</h1>
            <p>
              {assessment?.description || "This short trial assessment helps you understand how the assessment platform works before taking a real assessment."}
            </p>

            <div className="trial-instructions">
              <h2>What to expect</h2>
              <ul>
                {questions.some((q) => q.question_type === "MULTIPLE_CHOICE" || q.question_type === "multiple_choice") && <li>Multiple-choice questions</li>}
                {questions.some((q) => q.question_type === "FREE_TEXT" || q.question_type === "text") && <li>Free-text questions</li>}
                {questions.some((q) => q.question_type === "CODING" || q.question_type === "coding") && <li>A coding question</li>}
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const parseOptions = (question) => {
    if (Array.isArray(question?.options) && question.options.length > 0) {
      return question.options;
    }
    return [];
  };

  const mappedQuestion = question ? {
    id: question.question_id,
    type: (question.question_type === "MULTIPLE_CHOICE" || question.question_type === "multiple_choice")
      ? "mcq"
      : (question.question_type === "CODING" || question.question_type === "coding")
        ? "coding"
        : "text",
    question: question.description || question.question_text,
    options: parseOptions(question),
    starterCode: question.starter_code || "",
    placeholder: "Write your answer here...",
  } : null;

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
              {currentQuestion + 1} of {questionCount}
            </strong>
          </div>
          <div className="progress-timer">
            <span className="progress-label">Time Remaining</span>
            <strong>{formatTime(timeLeft)}</strong>
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
        {hint && <p className="trial-hint">Hint: {question?.hint || "No hint available"}</p>}
      </div>

      <Card padded className="trial-question-card">
        <Badge variant="info" className="question-type-badge">
          {mappedQuestion?.type === "mcq"
            ? "Multiple Choice Question"
            : mappedQuestion?.type === "text"
              ? "Free Text Question"
              : "Coding Question"}
        </Badge>

        <h2 className="trial-question-text">{mappedQuestion?.question || ""}</h2>

        {mappedQuestion?.type === "mcq" && (
          <div className="trial-options">
            {mappedQuestion.options.map((option) => (
              <label
                key={option.option_id ?? option.option_text}
                className={`trial-option ${
                  currentAnswer === option.option_text ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name={`trial-question-${question.question_id}`}
                  value={option.option_text}
                  checked={currentAnswer === option.option_text}
                  onChange={() => updateAnswer(option.option_text)}
                />
                <span className="option-marker" aria-hidden="true">
                  {String.fromCharCode(65 + mappedQuestion.options.indexOf(option))}
                </span>
                <span>{option.option_text}</span>
              </label>
            ))}
          </div>
        )}

        {mappedQuestion?.type === "text" && (
          <textarea
            className="trial-textarea"
            value={currentAnswer}
            onChange={(event) => updateAnswer(event.target.value)}
            placeholder={mappedQuestion.placeholder}
            rows={8}
          />
        )}

        {mappedQuestion?.type === "coding" && (
          <textarea
            className="trial-code-editor"
            value={currentAnswer || mappedQuestion.starterCode}
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

          {currentQuestion === questionCount - 1 ? (
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