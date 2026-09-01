import { useState, useEffect } from "react";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { Input, Textarea, Select } from "../../components/forms";
import { questionService } from "../../services/assessmentService";
import "./recruiter.css";
import "./recruiter-question-builder.css";

function mapBackendQuestion(q) {
  return {
    id: q.question_id,
    title: q.question_text || "Untitled question",
    category: q.language || "General",
    points: q.points ?? 0,
    question_type: q.question_type || "multiple_choice",
    description: q.description || "",
    starter_code: q.starter_code || "",
    time_limit: q.timelimit_seconds || 0,
  };
}

function RecruiterQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [qType, setQType] = useState("Multiple Choice");
  const [difficulty, setDifficulty] = useState("Medium");
  const [points, setPoints] = useState("10 pts");
  const [options, setOptions] = useState(["", "", "", ""]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await questionService.listQuestions();
        const mapped = (Array.isArray(data) ? data : []).map(mapBackendQuestion);
        if (cancelled) return;
        setQuestions(mapped);
        if (mapped.length > 0) {
          setSelectedId(mapped[0].id);
          populateEditor(mapped[0]);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load questions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function populateEditor(q) {
    setTitle(q.title);
    setPrompt(q.description);
    setQType(q.question_type === "coding" ? "Coding Challenge" : q.question_type === "free_text" ? "Free Text" : "Multiple Choice");
    setPoints(`${q.points} pts`);
  }

  function handleSelect(id) {
    setSelectedId(id);
    const q = questions.find((q) => q.id === id);
    if (q) populateEditor(q);
  }

  function addQuestion() {
    const next = { id: Date.now(), title: "Untitled question", category: "General", points: 5, question_type: "multiple_choice", description: "", starter_code: "", time_limit: 0 };
    setQuestions((current) => [...current, next]);
    setSelectedId(next.id);
    populateEditor(next);
  }

  function deleteQuestion(id) {
    setQuestions((current) => current.filter((q) => q.id !== id));
    if (selectedId === id) {
      const remaining = questions.filter((q) => q.id !== id);
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
        populateEditor(remaining[0]);
      } else {
        setSelectedId(null);
        setTitle("");
        setPrompt("");
      }
    }
  }

  if (loading) {
    return (
      <div className="question-builder">
        <div className="page-header">
          <p className="breadcrumb">Assessments / Question Builder</p>
          <h1>Question Builder</h1>
        </div>
        <p style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="question-builder">
        <div className="page-header">
          <p className="breadcrumb">Assessments / Question Builder</p>
          <h1>Question Builder</h1>
        </div>
        <p style={{ padding: "2rem", textAlign: "center", color: "#c00" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="question-builder">
      <div className="page-header">
        <p className="breadcrumb">Assessments / Question Builder</p>
        <h1>Question Builder</h1>
      </div>

      <div className="qb-columns">
        <section className="panel qb-list">
          <div className="panel-heading">
            <h2>Questions in Assessment</h2>
          </div>
          {questions.length === 0 ? (
            <p style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
              No questions yet. Click "Add New Question" to create one.
            </p>
          ) : (
            <ul className="qb-question-list">
              {questions.map((question) => (
                <li key={question.id}>
                  <button
                    type="button"
                    className={`qb-question-item ${selectedId === question.id ? "active" : ""}`}
                    onClick={() => handleSelect(question.id)}
                  >
                    <GripVertical size={16} className="qb-grip" />
                    <span className="qb-question-titles">
                      <strong>{question.title}</strong>
                      <small>
                        {question.category} <span>·</span> {question.points} pts
                      </small>
                    </span>
                    <button
                      type="button"
                      className="qb-delete"
                      aria-label={`Delete ${question.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteQuestion(question.id);
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div style={{ padding: "0.75rem 1rem" }}>
            <button type="button" className="qb-add-question" onClick={addQuestion}>
              <Plus size={16} />
              Add New Question
            </button>
          </div>
        </section>

        <section className="panel qb-editor">
          <div className="panel-heading">
            <div>
              <h2>Question Editor</h2>
              <p className="qb-editor-sub">
                Formulate code challenges or multiple choice assessments
              </p>
            </div>
            <Badge variant="info">{qType}</Badge>
          </div>

          <div className="panel-body">
            <Input
              label="Question Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Implement a deep clone helper"
            />

            <Textarea
              label="Question Text / Code Prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
            />

            <div className="qb-fields-row">
              <Select
                label="Question Type"
                value={qType}
                onChange={(event) => setQType(event.target.value)}
                options={[
                  { value: "Multiple Choice", label: "Multiple Choice" },
                  { value: "Free Text", label: "Free Text" },
                  { value: "Coding Challenge", label: "Coding Challenge" },
                ]}
              />
              <Select
                label="Difficulty Level"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
                options={[
                  { value: "Easy", label: "Easy" },
                  { value: "Medium", label: "Medium" },
                  { value: "Hard", label: "Hard" },
                ]}
              />
              <Select
                label="Points Weight"
                value={points}
                onChange={(event) => setPoints(event.target.value)}
                options={[
                  { value: "5 pts", label: "5 pts" },
                  { value: "10 pts", label: "10 pts" },
                  { value: "15 pts", label: "15 pts" },
                  { value: "20 pts", label: "20 pts" },
                ]}
              />
            </div>

            <div className="qb-options">
              <h3>Answer Options (Multiple Choice)</h3>
              {options.map((option, index) => (
                <div className="qb-option-row" key={index}>
                  <span className="qb-option-key">{String.fromCharCode(65 + index)}</span>
                  <input
                    className="input"
                    value={option}
                    onChange={(event) => {
                      const next = [...options];
                      next[index] = event.target.value;
                      setOptions(next);
                    }}
                  />
                  <input
                    type="radio"
                    name="correct-option"
                    aria-label={`Mark option ${String.fromCharCode(65 + index)} as correct`}
                  />
                </div>
              ))}
            </div>

            <div className="qb-editor-actions">
              <Button variant="secondary">Cancel</Button>
              <Button>Save Question</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default RecruiterQuestionsPage;
