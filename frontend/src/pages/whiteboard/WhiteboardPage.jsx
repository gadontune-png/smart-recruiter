import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Minus,
  Plus,
  Send,
  Clock,
  ArrowLeft,
  Code,
FileText,
  Terminal,
  Lightbulb,
  Info,
  AlertCircle,
  CheckCircle,
  Zap,
} from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { Select } from "../../components/forms";
import { submissionService, attemptService } from "../../services/assessmentService";
import "./WhiteboardPage.css";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

function WhiteboardPage() {
  const navigate = useNavigate();
  const params = useParams();
  const assessmentId = params.assessmentId;

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [ran, setRan] = useState(false);
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [question, setQuestion] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [runOutput, setRunOutput] = useState("");
  const [runStatus, setRunStatus] = useState(null);
  const [runError, setRunError] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [customOutput, setCustomOutput] = useState("");
  const [showCustomTest, setShowCustomTest] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadQuestion() {
      try {
        setLoading(true);
        if (assessmentId) {
          const attempt = await attemptService.startAttempt(assessmentId);
          setAttemptId(attempt?.id ?? attempt?.attempt_id ?? null);
          if (typeof attempt?.remaining_seconds === "number") {
            setTimeLeft(attempt.remaining_seconds);
          }
          const questionList = await attemptService.getQuestions(assessmentId);
          if (questionList && questionList.length > 0) {
            setQuestion(questionList[0]);
            if (questionList[0].starter_code) {
              setCode(questionList[0].starter_code);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load question:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuestion();
  }, [assessmentId]);

  const persistCode = useCallback(
    async (value) => {
      if (!attemptId || !question?.question_id) return;
      try {
        await attemptService.saveAnswer(attemptId, {
          question_id: question.question_id,
          code_submission: value,
          programming_language: language,
        });
      } catch (err) {
        console.error("Failed to save answer:", err);
      }
    },
    [attemptId, question, language]
  );

  const handleCodeChange = (value) => {
    setCode(value);
    persistCode(value);
  };

  const handleSubmit = useCallback(async () => {
    if (!code.trim()) return;
    try {
      if (attemptId) {
        await attemptService.submitAttempt(attemptId);
      } else {
        await submissionService.runCode({ code, language });
      }
    } catch (err) {
      setRunError(err.message || "Failed to submit solution");
      return;
    }
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [code, language, attemptId]);

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft, handleSubmit]);

  const lines = code.split("\n");

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLanguageChange = (event) => setLanguage(event.target.value);

  const handleReset = () => {
    setCode(question?.starter_code || "");
    setRan(false);
    setTestCases([]);
    setRunOutput("");
    setRunStatus(null);
    setRunError("");
    setShowCustomTest(false);
  };

  const handleRunCode = async (input) => {
    setRunning(true);
    setRan(true);
    setRunError("");
    try {
      const result = await submissionService.runCode({
        code: input || code,
        language,
      });
      setRunOutput(result?.stdout || "");
      setRunStatus(result?.status || "ok");
      if (result?.stderr) setRunError(result.stderr);
    } catch (err) {
      setRunOutput("");
      setRunError(err.message || "Failed to run code");
    } finally {
      setRunning(false);
    }
  };

  const handleRunCustomTest = () => {
    if (!customInput.trim()) return;
    setShowCustomTest(false);
    setCustomInput("");
    setCustomOutput("");
    handleRunCode(code);
  };

  const toggleFont = (delta) => {
    setFontSize((size) => Math.min(20, Math.min(11, size + delta)));
  };

  if (loading) {
    return (
      <div className="whiteboard-page">
        <div className="whiteboard-toolbar">
          <div className="wb-toolbar-left">
            <Button variant="ghost" onClick={() => navigate("/interviewee/assessments")}>
              <ArrowLeft size={16} />
              Back to Assessments
            </Button>
          </div>
        </div>
        <div className="whiteboard-complete">
          <p>Loading question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="whiteboard-page">
        <div className="whiteboard-toolbar">
          <div className="wb-toolbar-left">
            <Button variant="ghost" onClick={() => navigate("/interviewee/assessments")}>
              <ArrowLeft size={16} />
              Back to Assessments
            </Button>
          </div>
        </div>
        <div className="whiteboard-complete">
          <Badge variant="warning">No Question</Badge>
          <h1>No question available</h1>
          <p>There is no question loaded for this assessment.</p>
          <div className="whiteboard-complete-actions">
            <Button onClick={() => navigate("/interviewee/assessments")}>
              Back to Assessments
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="whiteboard-page">
        <div className="whiteboard-toolbar">
          <div className="wb-toolbar-left">
            <Button variant="ghost" onClick={() => navigate("/interviewee/assessments")}>
              <ArrowLeft size={16} />
              Back to Assessments
            </Button>
          </div>
        </div>
        <div className="whiteboard-complete">
          <Badge variant="success">Submitted</Badge>
          <h1>Solution Submitted!</h1>
          <p>Your code solution has been submitted successfully.</p>
          <div className="whiteboard-complete-actions">
            <Button onClick={() => navigate("/interviewee/assessments")}>
              Back to Assessments
            </Button>
            <Button variant="secondary" onClick={() => navigate("/interviewee/dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalPassed = runStatus === "ok" ? 1 : 0;
  const totalTests = ran && runStatus ? 1 : 0;

  return (
    <div className="whiteboard-page">
      {/* ---------- Top Toolbar ---------- */}
      <div className="whiteboard-toolbar">
        <div className="wb-toolbar-left">
          <Button variant="ghost" onClick={() => navigate("/interviewee/assessments")}>
            <ArrowLeft size={16} />
          </Button>
          <div className="wb-problem-badge">
            <Badge variant="primary">
              {question?.question_text || "Question"}
            </Badge>
            <span className="wb-problem-meta">
              {question?.difficulty || ""} · {question?.points || 0} pts
            </span>
          </div>
        </div>

        <div className="wb-toolbar-center">
          <Select
            aria-label="Language"
            className="wb-language-select"
            value={language}
            onChange={handleLanguageChange}
            options={LANGUAGES}
          />
          <span className="language-badge">{language}</span>

          <div className="wb-font-size">
            <button type="button" aria-label="Decrease font size" onClick={() => toggleFont(-1)}>
              <Minus size={14} />
            </button>
            <span>{fontSize}px</span>
            <button type="button" aria-label="Increase font size" onClick={() => toggleFont(1)}>
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="wb-toolbar-right">
          {timeLeft > 0 && (
            <div className={`wb-timer ${timeLeft < 60 ? "warning" : ""}`}>
              <Clock size={14} />
              {formatTime(timeLeft)}
            </div>
          )}
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset
          </Button>
          <Button variant="secondary" onClick={handleRunCode} disabled={running}>
            <Play size={16} />
            Run Code
          </Button>
          <Button className="wb-submit-btn" onClick={handleSubmit}>
            <Send size={16} />
            Submit Solution
          </Button>
        </div>
      </div>

      {/* ---------- 3-Column Layout ---------- */}
      <div className="whiteboard-layout">
        {/* ===== LEFT: Question ===== */}
        <section className="question-panel">
          <div className="question-header">
            <h2>
              <FileText size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Question
            </h2>
            <Badge variant="primary">{question?.difficulty || ""}</Badge>
          </div>

          <div className="question-content">
            <h1 className="question-title">{question?.question_text || ""}</h1>

            <div className="question-difficulty">
              {question?.difficulty && (
                <Badge variant={question.difficulty === "Hard" ? "danger" : question.difficulty === "Medium" ? "warning" : "success"}>
                  {question.difficulty}
                </Badge>
              )}
              <Badge variant="secondary">{question?.points || 0} Points</Badge>
            </div>

            <div className="question-section">
              <h3 className="question-section-title">Description</h3>
              <p className="question-description">
                {question?.description || ""}
              </p>
            </div>

            <div className="question-section">
              <h3 className="question-section-title">Examples</h3>
              {(question?.examples || []).map((example, index) => (
                <div className="question-example" key={index}>
                  <div className="example-label">Example {index + 1}</div>
                  <div className="example-input">Input: {example.input}</div>
                  <div className="example-output">Output: {example.output}</div>
                  {example.explanation && (
                    <div className="example-explanation">{example.explanation}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="question-section">
              <h3 className="question-section-title">Constraints</h3>
              <ul className="question-constraints">
                {(question?.constraints || []).map((constraint, index) => (
                  <li key={index}>
                    <CheckCircle size={12} style={{ display: "inline", marginRight: 6, color: "var(--color-success)" }} />
                    {constraint}
                  </li>
                ))}
              </ul>
            </div>

            {question?.starter_code && (
              <div className="question-section">
                <h3 className="question-section-title">
                  <Code size={14} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} />
                  Starter Code
                </h3>
                <pre
                  style={{
                    background: "var(--editor-bg)",
                    padding: "var(--space-3)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--font-size-sm)",
                    overflow: "auto",
                    fontFamily: "'JetBrains Mono', monospace",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {question.starter_code}
                </pre>
              </div>
            )}
          </div>

          {question?.submissions_count != null && (
            <div className="question-stats">
              <div className="stat-item">
                <Zap size={14} />
                <span>Submissions:</span>
                <span className="stat-value">{question.submissions_count}</span>
              </div>
              {question?.acceptance_rate != null && (
                <div className="stat-item">
                  <CheckCircle size={14} />
                  <span>Acceptance:</span>
                  <span className="stat-value">{question.acceptance_rate}%</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ===== CENTER: Code Editor ===== */}
        <section className="editor-panel">
          <div className="editor-toolbar">
            <div className="editor-toolbar-actions">
              <span className="language-badge">{language}</span>
            </div>
            <div className="console-actions">
              <button
                className="console-action-btn"
                onClick={() => setShowCustomTest(!showCustomTest)}
                title="Add custom test case"
              >
                <Zap size={14} /> Custom Test
              </button>
            </div>
          </div>

          {showCustomTest && (
            <div
              style={{
                padding: "var(--space-3) var(--space-4)",
                background: "var(--editor-surface)",
                borderBottom: "1px solid var(--editor-border)",
                display: "flex",
                gap: "var(--space-2)",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                className="test-case-input"
                placeholder='Enter input, e.g., [2,7,11,15], 9'
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                style={{ flex: 1, minWidth: "12rem" }}
              />
              <input
                className="test-case-input"
                placeholder="Expected output"
                value={customOutput}
                onChange={(e) => setCustomOutput(e.target.value)}
                style={{ flex: 1, minWidth: "12rem" }}
              />
              <Button size="sm" onClick={handleRunCustomTest}>
                <Play size={14} /> Run
              </Button>
            </div>
          )}

          <div className="code-editor-wrapper">
            <div className={`code-editor ${running ? "running" : ""}`}>
              <div className="code-gutter">
                {lines.map((_, index) => (
                  <div key={index}>{index + 1}</div>
                ))}
              </div>
              <textarea
                className="code-textarea"
                value={code}
                onChange={(event) => handleCodeChange(event.target.value)}
                spellCheck="false"
                style={{ fontSize: `${fontSize}px` }}
                aria-label="Code editor"
              />
              <div className="code-overlay" aria-hidden="true">
                <div style={{ fontSize: `${fontSize}px` }}>
                  {lines.map((line, index) => (
                    <pre key={index}>{line || " "}</pre>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="console-panel">
            <div className="console-head">
              <span>
                <Terminal size={14} style={{ marginRight: 8 }} />
                Output
              </span>
              {ran && (
                <span className="console-ok" style={{ fontSize: "var(--font-size-xs)" }}>
                  <CheckCircle size={14} style={{ display: "inline", marginRight: 4 }} />
                  {totalPassed}/{totalTests} passed
                </span>
              )}
            </div>
            <div className="console-body">
              {running ? (
                <>
                  <p className="console-line console-dim">Running tests...</p>
                  <p className="console-line console-dim" style={{ animation: "pulse 0.8s ease infinite" }}>
                    Compiling and executing code...
                  </p>
                </>
              ) : ran && runError ? (
                <>
                  <p className="console-line console-error">
                    <XCircle size={14} style={{ display: "inline", marginRight: 6 }} />
                    Execution failed: {runError}
                  </p>
                </>
              ) : ran ? (
                <>
                  <p className={`console-line ${runStatus === "ok" ? "console-ok" : "console-error"}`}>
                    {runStatus === "ok" ? (
                      <CheckCircle2 size={14} style={{ display: "inline", marginRight: 6 }} />
                    ) : (
                      <XCircle size={14} style={{ display: "inline", marginRight: 6 }} />
                    )}
                    {runStatus === "ok" ? "Executed successfully!" : `Status: ${runStatus}`}
                  </p>
                  {runOutput && (
                    <pre className="console-line console-output" style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
                      {runOutput}
                    </pre>
                  )}
                  <p className="console-line console-dim" style={{ marginTop: 8 }}>
                    &gt; Tests completed
                  </p>
                </>
              ) : (
                <p className="console-line console-dim">Press "Run Code" to execute your solution.</p>
              )}
            </div>
          </div>

          <div className="submit-section">
            <Button variant="secondary" onClick={handleReset}>
              <RotateCcw size={16} />
              Reset
            </Button>
            <Button onClick={handleRunCode} disabled={running}>
              <Play size={16} />
              Run Code
            </Button>
            <Button
              onClick={handleSubmit}
              style={{ marginLeft: "auto" }}
            >
              <Send size={16} />
              Submit Solution
            </Button>
          </div>
        </section>

        {/* ===== RIGHT: Test Cases ===== */}
        <aside className="tests-panel">
          <div className="tests-header">
            <h2>
              <Terminal size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Test Cases
            </h2>
            {totalTests > 0 && (
              <Badge variant={testCases.every((t) => t.passed) ? "success" : "danger"}>
                {totalPassed}/{totalTests} passing
              </Badge>
            )}
          </div>

          <div className="tests-list">
            {testCases.length === 0 ? (
              <p style={{ padding: "var(--space-4)", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                No test cases loaded. Run your code or add a custom test case.
              </p>
            ) : (
              testCases.map((test) => (
                <div
                  className={`test-card ${test.passed ? "passed" : !ran ? "" : "failed"} ${running ? "running" : ""}`}
                  key={test.name}
                >
                  <div className="test-card-head">
                    {test.passed ? (
                      <CheckCircle2 size={16} className="test-pass-icon" />
                    ) : (
                      <XCircle size={16} className="test-fail-icon" />
                    )}
                    <strong>{test.name}</strong>
                    <Badge variant={test.passed ? "success" : "danger"}>
                      {test.passed ? "Passed" : "Failed"}
                    </Badge>
                  </div>
                  {test.input && (
                    <div className="test-input">
                      <span className="example-label">Input:</span>{" "}
                      {test.input}
                    </div>
                  )}
                  {test.expected && (
                    <div className="test-expected">
                      <span className="example-label">Expected:</span>{" "}
                      {test.expected}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--color-border)" }}>
            <div className="question-section-title" style={{ marginBottom: "var(--space-3)" }}>
              <Info size={14} style={{ display: "inline", marginRight: 6 }} />
              Tips
            </div>
            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              <p style={{ margin: "0 0 var(--space-2) 0" }}>
                <Lightbulb size={14} style={{ display: "inline", marginRight: 6, color: "var(--color-warning)" }} />
                Try edge cases like empty arrays and single elements.
              </p>
              <p style={{ margin: 0 }}>
                <AlertCircle size={14} style={{ display: "inline", marginRight: 6, color: "var(--color-primary)" }} />
                Your solution must run within the time limit.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default WhiteboardPage;
