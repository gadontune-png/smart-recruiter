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
  FileText,
  Terminal,
  Lightbulb,
  Info,
  AlertCircle,
  CheckCircle,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { Select } from "../../components/forms";
import {
  submissionService,
  attemptService,
  assessmentService,
} from "../../services/assessmentService";
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

  const [question, setQuestion] = useState(null);
  const [questionList, setQuestionList] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answeredSet, setAnsweredSet] = useState(new Set());
  const [attemptId, setAttemptId] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [runOutput, setRunOutput] = useState("");
  const [runStatus, setRunStatus] = useState(null);
  const [runError, setRunError] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [customOutput, setCustomOutput] = useState("");
  const [showCustomTest, setShowCustomTest] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [locked, setLocked] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const timerRef = useRef(null);

  const applyQuestion = (q) => {
    if (!q) return;
    setQuestion(q);
    if (q.starter_code) {
      setCode(q.starter_code);
    } else {
      setCode("");
    }
  };

  const selectQuestion = (index) => {
    if (index < 0 || index >= questionList.length) return;
    setQuestionIndex(index);
    applyQuestion(questionList[index]);
    setTestCases([]);
    setRunOutput("");
    setRunStatus(null);
    setRunError("");
    setRan(false);
    setShowCustomTest(false);
  };

  const parseDescription = (raw) => {
    const blocks = [];
    let currentText = [];
    const flushText = () => {
      if (currentText.length) {
        blocks.push({ type: "text", lines: currentText });
        currentText = [];
      }
    };
    const lines = (raw || "").split("\n");
    let inCode = false;
    for (const line of lines) {
      const fence = line.match(/^\s*```+/);
      if (fence) {
        if (!inCode) {
          flushText();
          blocks.push({ type: "code", lines: [] });
          inCode = true;
        } else {
          inCode = false;
        }
        continue;
      }
      if (inCode) {
        blocks[blocks.length - 1].lines.push(line);
      } else {
        currentText.push(line);
      }
    }
    flushText();
    return blocks;
  };

  const renderInline = (text) => {
    const parts = String(text).split(/(`[^`]+`)/g);
    return parts.map((part, i) =>
      part.startsWith("`") && part.endsWith("`") ? (
        <code key={i} className="inline-code">
          {part.slice(1, -1)}
        </code>
      ) : (
        part
      )
    );
  };

  const renderTextLine = (line, i) => {
    const t = line.trim();
    if (!t) return <br key={i} />;
    const heading = t.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      if (/^examples?$/i.test(heading[2])) {
        return null;
      }
      return (
        <div key={i} className="md-heading">
          {renderInline(heading[2])}
        </div>
      );
    }
    if (/^[-*]\s+/.test(t)) {
      return (
        <li key={i} className="md-list-item">
          {renderInline(t.replace(/^[-*]\s+/, ""))}
        </li>
      );
    }
    return (
      <p key={i} className="md-paragraph">
        {renderInline(line)}
      </p>
    );
  };

  useEffect(() => {
    async function loadQuestion() {
      try {
        setLoading(true);
        if (!assessmentId) return;

        let attempt = null;
        let attemptError = "";
        try {
          attempt = await attemptService.startAttempt(assessmentId);
        } catch (err) {
          attemptError = err?.message || "Failed to start attempt";
        }

        const status = await attemptService
          .getAttemptStatus(assessmentId)
          .catch(() => null);
        if (status?.locked && !status?.active) {
          setLocked(true);
          setLoading(false);
          return;
        }

        setAttemptId(attempt?.id ?? attempt?.attempt_id ?? null);
        if (typeof attempt?.remaining_seconds === "number") {
          setTimeLeft(attempt.remaining_seconds);
        }

        const assess = await assessmentService
          .getAssessment(assessmentId)
          .catch(() => null);
        if (assess?.time_limit_minutes) {
          const total = assess.time_limit_minutes * 60;
          setTotalTime(total);
          if (attempt?.remaining_seconds == null) {
            setTimeLeft(total);
          }
        }

        let questionList = null;
        try {
          questionList = await attemptService.getQuestions(assessmentId);
        } catch (err) {
          if (!attemptError) {
            attemptError = err?.message || "Failed to load questions";
          }
        }

        const list = (questionList && questionList.length > 0)
          ? questionList
          : (assess?.questions || []);
        if (list.length > 0) {
          setQuestionList(list);
          setQuestionIndex(0);
          applyQuestion(list[0]);
          if (attemptError) setLoadError(attemptError);
          return;
        }

        setLoadError(
          attemptError ||
            "This assessment has no questions or your attempt is no longer active."
        );
      } catch (err) {
        console.error("Failed to load question:", err);
        setLoadError(err?.message || "Failed to load question");
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
    if (value.trim() && question?.question_id) {
      setAnsweredSet((prev) => new Set(prev).add(question.question_id));
    }
    persistCode(value);
  };

  const getNextUnansweredIndex = (fromIndex) => {
    const n = questionList.length;
    for (let i = fromIndex + 1; i < n; i++) {
      const q = questionList[i];
      if (q?.question_id && !answeredSet.has(q.question_id)) return i;
    }
    for (let i = 0; i < fromIndex; i++) {
      const q = questionList[i];
      if (q?.question_id && !answeredSet.has(q.question_id)) return i;
    }
    return -1;
  };

  const ensureAttempt = async () => {
    let currentAttemptId = attemptId;
    if (!currentAttemptId) {
      const attempt = await attemptService.startAttempt(assessmentId);
      currentAttemptId = attempt?.id ?? attempt?.attempt_id ?? null;
      if (currentAttemptId) setAttemptId(currentAttemptId);
    }
    return currentAttemptId;
  };

  const isFinalQuestion = questionList.length <= 1;
  const allAnswered =
    questionList.length > 0 &&
    questionList.every((q) => answeredSet.has(q.question_id));

  const handleSubmit = useCallback(
    async ({ final = false, force = false } = {}) => {
      if (!force && !code.trim()) {
        setRunError("Write a solution before submitting.");
        return;
      }
      if (locked) return;
      setRunning(true);
      try {
        const currentAttemptId = await ensureAttempt();
        if (!currentAttemptId) {
          setRunError("Could not start an attempt. Please try again.");
          return;
        }
        if (isFinalQuestion || final) {
          await attemptService.submitAttempt(currentAttemptId);
          clearInterval(timerRef.current);
          navigate("/interviewee/dashboard");
          return;
        }
        await attemptService.saveAnswer(currentAttemptId, {
          question_id: question?.question_id,
          code_submission: code,
          programming_language: language,
        });
        if (question?.question_id) {
          setAnsweredSet((prev) => new Set(prev).add(question.question_id));
        }
        const next = getNextUnansweredIndex(questionIndex);
        if (next === -1) {
          setSubmitMsg(
            "All questions answered. Press “Final Submit Assessment” to complete."
          );
          return;
        }
        selectQuestion(next);
        setSubmitMsg(`Solution saved. Next: Question ${next + 1}`);
      } catch (err) {
        setRunError(err?.message || "Failed to submit solution");
      } finally {
        setRunning(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [code, attemptId, locked, assessmentId, question, questionIndex, questionList, answeredSet, language]
  );

  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft > 0]);

  useEffect(() => {
    if (timeLeft === 0 && totalTime > 0 && !locked) {
      handleSubmitRef.current({ final: true, force: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

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
    setFontSize((size) => Math.max(11, Math.min(20, size + delta)));
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
          <p>
            {loadError ||
              "There is no question loaded for this assessment or your attempt is locked."}
          </p>
          <div className="whiteboard-complete-actions">
            <Button onClick={() => navigate("/interviewee/assessments")}>
              Back to Assessments
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (locked) {
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
          <h1>Assessment already submitted</h1>
          <p>
            You have already completed this assessment. It is locked for further
            attempts.
          </p>
          <div className="whiteboard-complete-actions">
            <Button onClick={() => navigate("/interviewee/results")}>
              View My Results
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
            <span className="wb-problem-title">
              {question?.question_text || "Question"}
            </span>
            <span className="wb-problem-meta">
              {question?.difficulty || ""} · {question?.points || 0} pts
              {questionList.length > 1 && (
                <span className="wb-question-count">
                  · Q{questionIndex + 1}/{questionList.length}
                </span>
              )}
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
          <div className={`wb-timer ${timeLeft < 60 ? "warning" : ""}`}>
            <Clock size={14} />
            <span className="wb-timer-value">{formatTime(timeLeft)}</span>
            {totalTime > 0 && (
              <span className="wb-timer-total">/ {Math.floor(totalTime / 60)} min</span>
            )}
          </div>
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset
          </Button>
          <Button variant="secondary" onClick={() => handleRunCode()} disabled={running}>
            <Play size={16} />
            Run Code
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

          {questionList.length > 0 && (
            <div className="question-navigator">
              <button
                type="button"
                className="wb-nav-btn"
                disabled={questionIndex === 0}
                onClick={() => selectQuestion(questionIndex - 1)}
                aria-label="Previous question"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="wb-nav-pills">
                {questionList.map((q, index) => {
                  const isAnswered =
                    q.question_id && answeredSet.has(q.question_id);
                  return (
                    <button
                      key={q.question_id ?? index}
                      type="button"
                      className={`wb-nav-pill ${
                        index === questionIndex ? "active" : ""
                      } ${isAnswered ? "answered" : ""}`}
                      onClick={() => selectQuestion(index)}
                      title={q.question_text || `Question ${index + 1}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="wb-nav-btn"
                disabled={questionIndex === questionList.length - 1}
                onClick={() => selectQuestion(questionIndex + 1)}
                aria-label="Next question"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

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
              <h3 className="question-section-title">
                <span className="section-dot" /> Description
              </h3>
              <div className="question-description">
                {(() => {
                  const blocks = parseDescription(question?.description || "");
                  return blocks
                    .filter((b) => b.type === "text")
                    .map((block, bi) => (
                      <div key={bi} className="md-block">
                        {block.lines.map((line, i) => renderTextLine(line, i))}
                      </div>
                    ));
                })()}
              </div>
            </div>

            {(() => {
              const codeBlocks = parseDescription(question?.description || "").filter(
                (b) => b.type === "code"
              );
              if (codeBlocks.length === 0) return null;
              return (
                <div className="question-section">
                  <h3 className="question-section-title">
                    <span className="section-dot" /> Examples
                  </h3>
                  {codeBlocks.map((block, index) => (
                    <div className="example-card" key={index}>
                      <div className="example-card-head">
                        <span className="example-card-bullets" aria-hidden="true">
                          <i /><i /><i />
                        </span>
                        <span className="example-card-label">Example {index + 1}</span>
                        <FileText size={13} />
                      </div>
                      <pre className="example-card-code">
                        {block.lines.length ? (
                          block.lines.join("\n")
                        ) : (
                          "// example"
                        )}
                      </pre>
                    </div>
                  ))}
                </div>
              );
            })()}

            {question?.starter_code && (
              <div className="question-section">
                <h3 className="question-section-title">
                  <span className="section-dot" /> Starter Code
                </h3>
                <pre className="example-card-code starter-code">
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
              <div className="code-gutter" style={{ fontSize: `${fontSize}px` }}>
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
            <Button onClick={() => handleRunCode()} disabled={running}>
              <Play size={16} />
              Run Code
            </Button>
            <Button
              className="wb-submit-btn"
              onClick={() => handleSubmit({ final: isFinalQuestion || allAnswered })}
              disabled={running}
              style={{ marginLeft: "auto" }}
            >
              <Send size={16} />
              {running
                ? "Submitting..."
                : isFinalQuestion || allAnswered
                ? "Final Submit Assessment"
                : "Submit Solution"}
            </Button>
          </div>
          {submitMsg && (
            <p className="wb-submit-msg">
              <CheckCircle2 size={14} style={{ verticalAlign: "middle" }} /> {submitMsg}
            </p>
          )}
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
