import { useState, useEffect } from "react";
import { Plus, GripVertical, Trash2, Download } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { Input, Textarea, Select } from "../../components/forms";
import {
  assessmentService,
  questionService,
} from "../../services/assessmentService";
import { codewarsService } from "../../services/codewarsService";
import "./recruiter.css";
import "./recruiter-question-builder.css";

function mapBackendQuestion(q) {
  return {
    id: q.question_id,
    question_id: q.question_id,
    title: q.question_text || "Untitled question",
    category: q.language || "General",
    points: q.points ?? 0,
    question_type: q.question_type || "MULTIPLE_CHOICE",
    description: q.description || "",
    starter_code: q.starter_code || "",
    time_limit: q.timelimit_seconds || 0,
    difficulty: q.difficulty || "Medium",
    _isNew: false,
  };
}

function extractKataId(raw) {
  const value = (raw || "").trim();
  if (!value) return "";
  const match = value.match(/\/kata\/?([^/?#]+)/);
  return match ? match[1] : value;
}

function RecruiterQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [qType, setQType] = useState("Multiple Choice");
  const [difficulty, setDifficulty] = useState("Medium");
  const [points, setPoints] = useState("10 pts");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [kataId, setKataId] = useState("");
  const [kataBusy, setKataBusy] = useState(false);
  const [kataError, setKataError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadAssessments() {
      try {
        const data = await assessmentService.listMyAssessments();
        const list = Array.isArray(data) ? data : [];
        if (cancelled) return;
        setAssessments(list);
        if (list.length > 0) setSelectedAssessment(String(list[0].assessment_id));
      } catch {
        // no assessments available
      }
    }
    loadAssessments();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = selectedAssessment
          ? await questionService.listQuestions(Number(selectedAssessment))
          : await questionService.listQuestions();
        const mapped = (Array.isArray(data) ? data : []).map(mapBackendQuestion);
        if (cancelled) return;
        setQuestions(mapped);
        if (mapped.length > 0) {
          setSelectedId(mapped[0].id);
          populateEditor(mapped[0]);
        } else {
          setSelectedId(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load questions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedAssessment]);

  function populateEditor(q) {
    setTitle(q.title);
    setPrompt(q.description);
    setQType(q.question_type === "CODING" ? "Coding Challenge" : q.question_type === "FREE_TEXT" ? "Free Text" : "Multiple Choice");
    setPoints(`${q.points} pts`);
    setDifficulty(q.difficulty || "Medium");
    setOptions(Array.isArray(q.options) && q.options.length > 0 ? q.options.map((o) => o.option_text) : ["", "", "", ""]);
  }

  function handleSelect(id) {
    setSelectedId(id);
    const q = questions.find((q) => q.id === id);
    if (q) populateEditor(q);
  }

  function addQuestion() {
    const next = { id: Date.now(), question_id: null, title: "Untitled question", category: "General", points: 5, question_type: "MULTIPLE_CHOICE", description: "", starter_code: "", time_limit: 0, _isNew: true };
    setQuestions((current) => [...current, next]);
    setSelectedId(next.id);
    populateEditor(next);
  }

  async function deleteQuestion(id) {
    const q = questions.find((item) => item.id === id);
    if (q && !q._isNew && q.question_id) {
      try {
        await questionService.deleteQuestion(q.question_id);
      } catch (err) {
        setError(err.message || "Failed to delete question");
        return;
      }
    }
    setQuestions((current) => current.filter((item) => item.id !== id));
    if (selectedId === id) {
      const remaining = questions.filter((item) => item.id !== id);
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

  async function saveQuestion() {
    if (!selectedId) return;
    const selected = questions.find((q) => q.id === selectedId);
    if (!selected) return;
    if (!selectedAssessment) {
      setError("Select an assessment first");
      return;
    }

    const pointsValue = parseInt(points.replace(" pts", ""), 10) || 0;
    const payload = {
      assessment_id: Number(selectedAssessment),
      question_text: title || "Untitled question",
      question_type: qType === "Coding Challenge" ? "CODING" : qType === "Free Text" ? "FREE_TEXT" : "MULTIPLE_CHOICE",
      points: pointsValue,
      description: prompt || "",
      difficulty: difficulty || "Medium",
      options: qType === "Multiple Choice"
        ? options.filter((option) => option.trim() !== "").map((option) => ({ option_text: option, is_correct: false }))
        : [],
    };

    try {
      let saved;
      if (selected._isNew || !selected.question_id) {
        saved = await questionService.createQuestion(payload);
      } else {
        saved = await questionService.updateQuestion(selected.question_id, {
          question_text: payload.question_text,
          question_type: payload.question_type,
          points: payload.points,
          description: payload.description,
          options: payload.options,
        });
      }
      const normalized = Array.isArray(saved) ? saved[0] : saved;
      if (normalized && normalized.question_id) {
        const mapped = mapBackendQuestion(normalized);
        setQuestions((current) =>
          current.map((q) =>
            q.id === selectedId
              ? {
                  ...q,
                  ...mapped,
                  id: selectedId,
                  question_id: normalized.question_id,
                  _isNew: false,
                }
              : q
          )
        );
      }
    } catch (err) {
      setError(err.message || "Failed to save question");
    }
  }

  async function importFromCodewars() {
    const id = extractKataId(kataId);
    if (!id) {
      setKataError("Enter a valid Codewars kata ID or URL");
      return;
    }
    if (!selectedAssessment) {
      setKataError("Select an assessment first");
      return;
    }
    setKataBusy(true);
    setKataError("");
    try {
      const kata = await codewarsService.getKata(id);
      const payload = {
        assessment_id: Number(selectedAssessment),
        question_text: kata.title || "Untitled kata",
        question_type: "CODING",
        description: kata.prompt || "",
        difficulty: kata.difficulty || "Medium",
        points: 10,
        language: Array.isArray(kata.languages) && kata.languages.length > 0 ? kata.languages[0] : "javascript",
        starter_code: "",
        options: [],
      };
      await questionService.createQuestion(payload);
      const data = await questionService.listQuestions(Number(selectedAssessment));
      const mapped = (Array.isArray(data) ? data : []).map(mapBackendQuestion);
      setQuestions(mapped);
      if (mapped.length > 0) {
        setSelectedId(mapped[0].id);
        populateEditor(mapped[0]);
      }
      setKataId("");
    } catch (err) {
      setKataError(err.message || "Failed to import kata from Codewars");
    } finally {
      setKataBusy(false);
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

      <div className="panel" style={{ padding: "1rem 1.25rem", marginBottom: "1rem" }}>
        <Select
          label="Assessment"
          value={selectedAssessment}
          onChange={(event) => {
            setSelectedAssessment(event.target.value);
            setSelectedId(null);
          }}
          options={assessments.map((assessment) => ({
            value: String(assessment.assessment_id),
            label: `${assessment.title} (#${assessment.assessment_id})`,
          }))}
        />
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
            <div className="qw-import">
              <h3>Import from Codewars</h3>
              <div className="qw-import-row">
                <input
                  className="input"
                  placeholder="Kata ID or URL, e.g. 55c04b4cc56a697bb0000048"
                  value={kataId}
                  onChange={(event) => setKataId(event.target.value)}
                />
                <Button
                  variant="secondary"
                  disabled={kataBusy}
                  onClick={importFromCodewars}
                >
                  <Download size={16} />
                  {kataBusy ? "Importing..." : "Import"}
                </Button>
              </div>
              {kataError && <p className="qw-import-error">{kataError}</p>}
            </div>

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
              <Button variant="secondary" onClick={() => { if (selectedId) handleSelect(selectedId); }}>
                Cancel
              </Button>
              <Button onClick={saveQuestion}>Save Question</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default RecruiterQuestionsPage;
