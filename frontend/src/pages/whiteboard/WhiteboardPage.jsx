import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import "./WhiteboardPage.css";

const LANGUAGES = ["JavaScript", "Python", "Java", "C++"];

const INITIAL_CODE = {
  JavaScript: `function solve(numbers) {
  // Write your solution here

  return numbers;
}`,
  Python: `def solve(numbers):
    # Write your solution here

    return numbers`,
  Java: `public class Solution {
    public static int[] solve(int[] numbers) {
        // Write your solution here

        return numbers;
    }
}`,
  "C++": `#include <vector>
using namespace std;

vector<int> solve(vector<int> numbers) {
    // Write your solution here

    return numbers;
}`,
};

function WhiteboardPage() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState("JavaScript");
  const [bdd, setBdd] = useState(
    "Given a list of numbers\nWhen the solution is executed\nThen the expected result should be returned",
  );
  const [pseudocode, setPseudocode] = useState(
    "1. Receive the input numbers\n2. Process the numbers\n3. Return the result",
  );
  const [code, setCode] = useState(INITIAL_CODE.JavaScript);
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;

    setLanguage(selectedLanguage);
    setCode(INITIAL_CODE[selectedLanguage]);
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setError("");
  };

  const handleClear = () => {
    setCode("");
    setSaved(false);
  };

  const handleFormat = () => {
    setCode((previousCode) => previousCode.trim());
    setSaved(false);
  };

  const handleSubmit = () => {
    if (!code.trim()) {
      setError("Please write your solution before submitting.");
      return;
    }

    setError("");
    setShowConfirmation(true);
  };

  const confirmSubmission = () => {
    setSubmitted(true);
    setShowConfirmation(false);
  };

  if (submitted) {
    return (
      <div className="whiteboard-page">
        <Card padded>
          <div className="whiteboard-complete">
            <Badge variant="success">Submitted</Badge>

            <h1>Solution submitted!</h1>

            <p>
              Your BDD, pseudocode, and code solution have been submitted
              successfully.
            </p>

            <div className="submission-status">
              <span>Submission status</span>
              <strong>Submitted</strong>
            </div>

            <div className="whiteboard-complete-actions">
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
    <div className="whiteboard-page">
      <div className="whiteboard-header">
        <div>
          <p className="whiteboard-label">Technical Challenge</p>
          <h1>Whiteboard & Coding Workspace</h1>
          <p>
            Work through the problem using BDD, pseudocode, and code before
            submitting your solution.
          </p>
        </div>

        <Badge variant={saved ? "success" : "warning"}>
          {saved ? "Draft saved" : "Unsaved changes"}
        </Badge>
      </div>

      <div className="whiteboard-layout">
        <aside className="whiteboard-sidebar">
          <Card padded>
            <h2>Problem statement</h2>

            <p>
              Given an array of numbers, create a solution that processes the
              values and returns the expected result.
            </p>

            <h3>Examples</h3>

            <div className="example-box">
              <strong>Example 1</strong>
              <span>Input: [1, 2, 3]</span>
              <span>Output: [1, 2, 3]</span>
            </div>

            <div className="example-box">
              <strong>Example 2</strong>
              <span>Input: [5, 10, 15]</span>
              <span>Output: [5, 10, 15]</span>
            </div>

            <h3>Constraints</h3>

            <ul className="constraint-list">
              <li>Input contains at least one number.</li>
              <li>Values are valid numbers.</li>
              <li>Your solution should be efficient.</li>
            </ul>
          </Card>
        </aside>

        <main className="whiteboard-main">
          <Card padded>
            <div className="editor-section">
              <div className="editor-header">
                <div>
                  <h2>BDD</h2>
                  <span>Describe the expected behaviour.</span>
                </div>
              </div>

              <textarea
                className="whiteboard-editor"
                value={bdd}
                onChange={(event) => {
                  setBdd(event.target.value);
                  setSaved(false);
                }}
                rows={6}
              />
            </div>

            <div className="editor-section">
              <div className="editor-header">
                <div>
                  <h2>Pseudocode</h2>
                  <span>Plan your solution before coding.</span>
                </div>
              </div>

              <textarea
                className="whiteboard-editor"
                value={pseudocode}
                onChange={(event) => {
                  setPseudocode(event.target.value);
                  setSaved(false);
                }}
                rows={7}
              />
            </div>

            <div className="editor-section">
              <div className="editor-header">
                <div>
                  <h2>Code</h2>
                  <span>Write and test your final solution.</span>
                </div>

                <select
                  className="language-selector"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  {LANGUAGES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                className="code-editor"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  setSaved(false);
                }}
                spellCheck="false"
                rows={18}
              />

              <div className="editor-actions">
                <Button variant="secondary" onClick={handleFormat}>
                  Format
                </Button>

                <Button variant="secondary" onClick={handleClear}>
                  Clear
                </Button>

                <Button onClick={handleSave}>Save Draft</Button>
              </div>

              {saved && (
                <p className="save-message">
                  Your draft has been saved successfully.
                </p>
              )}
            </div>

            {error && (
              <div className="whiteboard-error">
                <strong>Unable to submit</strong>
                <span>{error}</span>
              </div>
            )}

            <div className="whiteboard-submit">
              <div>
                <strong>Ready to submit?</strong>
                <span>
                  Make sure your BDD, pseudocode, and code are complete.
                </span>
              </div>

              <Button size="lg" onClick={handleSubmit}>
                Submit Solution
              </Button>
            </div>
          </Card>
        </main>
      </div>

      {showConfirmation && (
        <div className="whiteboard-modal-backdrop">
          <div className="whiteboard-modal">
            <Badge variant="warning">Confirm submission</Badge>

            <h2>Submit your solution?</h2>

            <p>
              Once submitted, you will not be able to make changes to this
              solution.
            </p>

            <div className="whiteboard-modal-actions">
              <Button
                variant="secondary"
                onClick={() => setShowConfirmation(false)}
              >
                Continue Editing
              </Button>

              <Button onClick={confirmSubmission}>
                Confirm Submission
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WhiteboardPage;

