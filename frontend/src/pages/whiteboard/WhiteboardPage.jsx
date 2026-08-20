import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, RotateCcw, CheckCircle2, XCircle, Minus, Plus, Send } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { Select } from "../../components/forms";
import "./WhiteboardPage.css";

const LANGUAGES = ["JavaScript", "Python", "Java", "C++"];

const INITIAL_LINES = [
  "/**",
  " * @param {number[]} nums",
  " * @param {number} target",
  " * @return {number[]}",
  " */",
  "const twoSum = function(nums, target) {",
  "    const map = new Map();",
  "    for (let i = 0; i < nums.length; i++) {",
  "        const complement = target - nums[i];",
  "        if (map.has(complement)) {",
  "            return [map.get(complement), i];",
  "        }",
  "        map.set(nums[i], i);",
  "    }",
  "    return [];",
  "};",
];

const INITIAL_CODE = INITIAL_LINES.join("\n");

const TEST_CASES = [
  { name: "Test Case 1: Standard Input", input: "nums = [2, 7, 11, 15], target = 9", passed: true },
  { name: "Test Case 2: Out of Order", input: "nums = [3, 2, 4], target = 6", passed: true },
  { name: "Test Case 3: Negative Numbers", input: "nums = [-1, -3, 4, 2], target = -4", passed: false },
];

function WhiteboardPage() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState("JavaScript");
  const [code, setCode] = useState(INITIAL_CODE);
  const [fontSize, setFontSize] = useState(14);
  const [ran, setRan] = useState(false);
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const lines = code.split("\n");

  const handleLanguageChange = (event) => setLanguage(event.target.value);

  const handleReset = () => {
    setCode(INITIAL_CODE);
    setRan(false);
  };

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setRan(true);
    }, 600);
  };

  const handleSubmit = () => {
    if (!code.trim()) return;
    setSubmitted(true);
  };

  const toggleFont = (delta) => {
    setFontSize((size) => Math.min(20, Math.max(11, size + delta)));
  };

  if (submitted) {
    return (
      <div className="whiteboard-page">
        <div className="whiteboard-complete">
          <Badge variant="success">Submitted</Badge>
          <h1>Solution submitted!</h1>
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

  return (
    <div className="whiteboard-page">
      <div className="whiteboard-toolbar">
        <div className="wb-problem">
          <Badge variant="primary">Two Sum</Badge>
          <span className="wb-problem-meta">Easy · Array, Hash Map</span>
        </div>

        <div className="wb-controls">
          <Select
            aria-label="Language"
            className="wb-language-select"
            value={language}
            onChange={handleLanguageChange}
            options={LANGUAGES.map((lang) => ({ value: lang, label: lang }))}
          />
          <div className="wb-font-size">
            <button type="button" aria-label="Decrease font size" onClick={() => toggleFont(-1)}>
              <Minus size={14} />
            </button>
            <span>{fontSize}px</span>
            <button type="button" aria-label="Increase font size" onClick={() => toggleFont(1)}>
              <Plus size={14} />
            </button>
          </div>
          <Button variant="secondary" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset Code
          </Button>
          <Button onClick={handleRun}>
            <Play size={16} />
            Run Code
          </Button>
        </div>

        <Button className="wb-submit-top" onClick={handleSubmit}>
          <Send size={16} />
          Submit Solution
        </Button>
      </div>

      <div className="whiteboard-layout">
        <section className="editor-pane">
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

          <div className="console-panel">
            <div className="console-head">Console Output</div>
            <div className="console-body">
              {running ? (
                <p className="console-line">Running tests...</p>
              ) : ran ? (
                <>
                  <p className="console-line">&gt; Executed: twoSum([2, 7, 11, 15], 9)</p>
                  <p className="console-line">&gt; Output: [0, 1]</p>
                  <p className="console-line console-ok">&gt; Finished in 0.04s</p>
                </>
              ) : (
                <p className="console-line console-dim">Press Run Code to execute your solution.</p>
              )}
            </div>
          </div>
        </section>

        <aside className="tests-pane">
          <div className="tests-head">
            <h2>Test Cases</h2>
            <Badge variant={TEST_CASES.every((t) => t.passed) ? "success" : "danger"}>
              {TEST_CASES.filter((t) => t.passed).length}/{TEST_CASES.length} passing
            </Badge>
          </div>

          <div className="tests-list">
            {TEST_CASES.map((test) => (
              <div className={`test-card ${test.passed ? "passed" : "failed"}`} key={test.name}>
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
                <p className="test-input">{test.input}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default WhiteboardPage;