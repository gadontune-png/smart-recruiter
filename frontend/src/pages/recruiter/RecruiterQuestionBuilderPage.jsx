import { useState } from "react";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import PageHeader from "../../components/layout/PageHeader";
import { mockQuestions } from "../../data/mock/assessments";

function RecruiterQuestionBuilderPage() {
  const [questions, setQuestions] = useState(mockQuestions);
  const [showForm, setShowForm] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("multiple_choice");
  const [points, setPoints] = useState(5);

  const addQuestion = (event) => {
    event.preventDefault();

    if (!prompt.trim()) return;

    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        assessment_id: "a-1",
        type,
        prompt: prompt.trim(),
        points: Number(points),
      },
    ]);

    setPrompt("");
    setType("multiple_choice");
    setPoints(5);
    setShowForm(false);
  };

  return (
    <div>
      <PageHeader
        title="Question Builder"
        description="Create and manage questions for technical assessments."
        actions={
          <Button onClick={() => setShowForm((value) => !value)}>
            {showForm ? "Cancel" : "Add Question"}
          </Button>
        }
      />

      {showForm && (
        <Card padded>
          <h2>Add Question</h2>

          <form
            onSubmit={addQuestion}
            style={{
              display: "grid",
              gap: "var(--space-4)",
              maxWidth: "40rem",
            }}
          >
            <label>
              Question
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Enter your question..."
                required
                rows="4"
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "var(--space-2)",
                  padding: "var(--space-3)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  resize: "vertical",
                }}
              />
            </label>

            <label>
              Question type
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "var(--space-2)",
                  padding: "var(--space-3)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="subjective">Subjective</option>
                <option value="coding">Coding</option>
              </select>
            </label>

            <label>
              Points
              <input
                type="number"
                min="1"
                value={points}
                onChange={(event) => setPoints(event.target.value)}
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

            <Button type="submit">Add Question</Button>
          </form>
        </Card>
      )}

      <div
        style={{
          display: "grid",
          gap: "var(--space-4)",
          marginTop: "var(--space-5)",
        }}
      >
        {questions.map((question, index) => (
          <Card key={question.id}>
            <Card.Body>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "var(--space-4)",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      color: "var(--color-text-muted)",
                      fontSize: "var(--font-size-xs)",
                    }}
                  >
                    Question {index + 1}
                  </p>

                  <h3>{question.prompt}</h3>

                  <p
                    style={{
                      marginBottom: 0,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {question.points} points
                  </p>
                </div>

                <Badge variant="primary">
                  {question.type.replace("_", " ")}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default RecruiterQuestionBuilderPage;