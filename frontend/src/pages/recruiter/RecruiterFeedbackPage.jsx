import { useState } from "react";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import PageHeader from "../../components/layout/PageHeader";

function RecruiterFeedbackPage() {
  const [results, setResults] = useState([
    {
      id: 1,
      candidate: "John Doe",
      assessment: "Frontend Engineer Screen",
      score: 88,
      feedback: "",
      released: false,
    },
    {
      id: 2,
      candidate: "Jane Smith",
      assessment: "Backend Engineer Screen",
      score: 72,
      feedback: "",
      released: false,
    },
  ]);

  const updateFeedback = (id, feedback) => {
    setResults(
      results.map((result) =>
        result.id === id ? { ...result, feedback } : result
      )
    );
  };

  const releaseGrade = (id) => {
    setResults(
      results.map((result) =>
        result.id === id ? { ...result, released: true } : result
      )
    );
  };

  return (
    <div>
      <PageHeader
        title="Feedback & Grade Release"
        description="Review candidate performance, add feedback and release grades."
      />

      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        {results.map((result) => (
          <Card key={result.id}>
            <Card.Body>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "var(--space-4)",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>{result.candidate}</h2>
                  <p>{result.assessment}</p>
                  <strong>Score: {result.score}%</strong>
                </div>

                <Badge variant={result.released ? "success" : "warning"}>
                  {result.released ? "Grade Released" : "Not Released"}
                </Badge>
              </div>

              <label
                style={{
                  display: "block",
                  marginTop: "var(--space-5)",
                }}
              >
                Feedback
                <textarea
                  value={result.feedback}
                  onChange={(e) =>
                    updateFeedback(result.id, e.target.value)
                  }
                  placeholder="Write feedback for the candidate..."
                  rows="4"
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: "var(--space-2)",
                    padding: "var(--space-3)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                  }}
                />
              </label>

              <div style={{ marginTop: "var(--space-4)" }}>
                <Button
                  disabled={result.released}
                  onClick={() => releaseGrade(result.id)}
                >
                  {result.released ? "Grade Released" : "Release Grade"}
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default RecruiterFeedbackPage;