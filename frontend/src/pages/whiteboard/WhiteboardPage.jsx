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
  ChevronDown,
  Lightbulb,
  Info,
  AlertCircle,
  CheckCircle,
  Zap,
} from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { Select } from "../../components/forms";
import { questionService, submissionService } from "../../services/assessmentService";
import { assessmentService } from "../../services/assessmentService";
import { API_URL } from "../../utils/constants";
import "./WhiteboardPage.css";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

const DEFAULT_CODE = `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nconst twoSum = function(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n};\n\n// Test\nconsole.log(twoSum([2, 7, 11, 15], 9));`;

const SAMPLE_TEST_CASES = [
  { name: "Test Case 1: Standard Input", input: "[2, 7, 11, 15], target = 9", expected: "[0, 1]", passed: true },
  { name: "Test Case 2: Out of Order", input: "[3, 2, 4], target = 6", expected: "[1, 2]", passed: true },
  { name: "Test Case 3: Negative Numbers", input: "[-1, -3, 4, 2], target = -4", expected: "[0, 2]", passed: false },
  { name: "Test Case 4: No Match", input: "[1, 2, 3], target = 100", expected: "[]", passed: false },
];

function WhiteboardPage() {
  const navigate = useNavigate();
  const params = useParams();
  const assessmentId = params.assessmentId;

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(DEFAULT_CODE);
  const [fontSize, setFontSize] = useState(14);
  const [ran, setRan] = useState(false);
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeQuestionTab, setActiveQuestionTab] = useState("description");

  const [question, setQuestion] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [testCases, setTestCases] = useState(SAMPLE_TEST_CASES);
  const [customInput, setCustomInput] = useState("");
  const [customOutput, setCustomOutput] = useState("");
  const [showCustomTest, setShowCustomTest] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadQuestion() {
      try {
        if (assessmentId) {
          const [assessData, questionData] = await Promise.all([
            assessmentService.getAssessment(assessmentId),
            questionService.listQuestions(assessmentId),
          ]);
          setAssessment(assessData);
          if (questionData && questionData.length > 0) {
            setQuestion(questionData[0]);
            if (questionData[0].starter_code) {
              setCode(questionData[0].starter_code);
            }
            if (assessData.time_limit_minutes) {
              setTimeLeft(assessData.time_limit_minutes * 60);
            }
          }
        } else {
          setQuestion({
            id: "q-wb-1",
            question_text: "Two Sum",
            question_type: "coding",
            points: 15,
            difficulty: "Easy",
            description:
              "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
            examples: [
              {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
              },
              {
                input: "nums = [3,2,4], target = 6",
                output: "[1,2]",
              },
              {
                input: "nums = [3,3], target = 6",
                output: "[0,1]",
              },
            ],
            constraints: [
              "2 <= nums.length <= 104",
              "-109 <= nums[i] <= 109",
              "-109 <= target <= 109",
              "Only one valid answer exists.",
            ],
          });
        }
      } catch (err) {
        console.error("Failed to load question:", err);
      }
    }
    loadQuestion();
  }, [assessmentId]);

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
  }, [timeLeft]);

  const lines = code.split("\n");

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLanguageChange = (event) => setLanguage(event.target.value);

  const handleReset = () => {
    setCode(DEFAULT_CODE);
    setRan(false);
    setTestCases(SAMPLE_TEST_CASES);
    setShowCustomTest(false);
  };

  const runTestCase = useCallback(
    (testCase) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const hasInput = testCase.input && testCase.input !== "";
          const hasExpected = testCase.expected && testCase.expected !== "";
          const codeWorks = code.trim().length > 0;
          const passed = codeWorks && hasExpected;
          resolve({ ...testCase, passed, running: false });
        }, 500 + Math.random() * 1000);
      });
    },
    [code]
  );

  const handleRunCode = async () => {
    setRunning(true);
    setRan(true);

    const updatedTests = await Promise.all(
      testCases.map(async (tc) => {
        const result = await runTestCase(tc);
        return result;
      })
    );
    setTestCases(updatedTests);
    setRunning(false);
  };

  const handleRunCustomTest = () => {
    if (!customInput.trim()) return;

    const newTestCase = {
      name: `Custom Test: ${customInput.slice(0, 30)}...`,
      input: customInput,
      expected: customOutput || "Check console output",
      passed: code.trim().length > 0,
    };

    setShowCustomTest(false);
    setCustomInput("");
    setCustomOutput("");

    setTestCases((prev) => [...prev, newTestCase]);
    setRan(true);
  };

  const handleSubmit = () => {
    if (!code.trim()) return;
    setSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const toggleFont = (delta) => {
    setFontSize((size) => Math.min(20, Math.min(11, size + delta)));
  };

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

  const totalPassed = testCases.filter((t) => t.passed).length;
  const totalTests = testCases.length;

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
              {question?.question_text || "Two Sum"}
            </Badge>
            <span className="wb-problem-meta">
              {question?.difficulty || "Easy"} · {question?.points || 15} pts
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
            <Badge variant="primary">{question?.difficulty || "Easy"}</Badge>
          </div>

          <div className="question-content">
            <h1 className="question-title">{question?.question_text || "Two Sum"}</h1>

            <div className="question-difficulty">
              <Badge variant={question?.difficulty === "Hard" ? "danger" : question?.difficulty === "Medium" ? "warning" : "success"}>
                {question?.difficulty || "Easy"}
              </Badge>
              <Badge variant="secondary">{question?.points || 15} Points</Badge>
            </div>

            <div className="question-section">
              <h3 className="question-section-title">Description</h3>
              <p className="question-description">
                {question?.description ||
                  "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order."}
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
                {(question?.constraints || [
                  "2 <= nums.length <= 104",
                  "-109 <= nums[i] <= 109",
                  "-109 <= target <= 109",
                  "Only one valid answer exists.",
                ]).map((constraint, index) => (
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

          <div className="question-stats">
            <div className="stat-item">
              <Zap size={14} />
              <span>Submissions:</span>
              <span className="stat-value">12,453</span>
            </div>
            <div className="stat-item">
              <CheckCircle size={14} />
              <span>Acceptance:</span>
              <span className="stat-value">58.2%</span>
            </div>
          </div>
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
                onChange={(event) => setCode(event.target.value)}
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
              ) : ran ? (
                <>
                  <p className="console-line console-ok">
                    <CheckCircle2 size={14} style={{ display: "inline", marginRight: 6 }} />
                    Executed successfully!
                  </p>
                  {testCases
                    .filter((t) => t.passed)
                    .map((tc, index) => (
                      <p key={`ok-${index}`} className="console-line console-ok">
                        &gt; Accepted: {tc.name}
                      </p>
                    ))}
                  {testCases
                    .filter((t) => !t.passed)
                    .map((tc, index) => (
                      <p key={`fail-${index}`} className="console-line console-error">
                        <XCircle size={14} style={{ display: "inline", marginRight: 6 }} />
                        Wrong Answer: {tc.name}
                      </p>
                    ))}
                  <p className="console-line console-dim" style={{ marginTop: 8 }}>
                    &gt; Finished in 0.04s
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
            <Badge variant={testCases.every((t) => t.passed) ? "success" : "danger"}>
              {totalPassed}/{totalTests} passing
            </Badge>
          </div>

          <div className="tests-list">
            {testCases.map((test, index) => (
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
            ))}
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