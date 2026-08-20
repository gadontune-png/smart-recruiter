import { useState } from "react";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { Input, Textarea, Select } from "../../components/forms";
import "./recruiter.css";
import "./recruiter-question-builder.css";

const INITIAL_QUESTIONS = [
  { id: 1, title: "Implement a deep clone helper", category: "React", points: 10 },
  { id: 2, title: "State slice reconciliation", category: "React", points: 15 },
  { id: 3, title: "Optimize expensive rendering logic", category: "React", points: 15 },
  { id: 4, title: "CSS Flexbox layouts", category: "HTML/CSS", points: 5 },
  { id: 5, title: "Validate balanced brackets", category: "Algorithms", points: 20 },
];

const INITIAL_OPTIONS = [
  "JSON.parse(JSON.stringify(obj))",
  "Writing a recursive key-by-key map iteration",
  "Object.assign({}, obj) reference copy",
  "Utilizing custom lodash.cloneDeep utility",
];

function RecruiterQuestionsPage() {
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [selectedId, setSelectedId] = useState(1);
  const [title, setTitle] = useState("Implement a deep clone helper");
  const [prompt, setPrompt] = useState(
    "Write a function that accepts an object and returns a deep copy of that object. Ensure circular references do not throw.",
  );
  const [qType, setQType] = useState("Multiple Choice");
  const [difficulty, setDifficulty] = useState("Medium");
  const [points, setPoints] = useState("10 pts");
  const [options, setOptions] = useState(INITIAL_OPTIONS);

  function handleSelect(id) {
    setSelectedId(id);
  }

  function addQuestion() {
    const next = { id: Date.now(), title: "Untitled question", category: "General", points: 5 };
    setQuestions((current) => [...current, next]);
    setSelectedId(next.id);
  }

  function deleteQuestion(id) {
    setQuestions((current) => current.filter((q) => q.id !== id));
    if (selectedId === id) setSelectedId(questions.find((q) => q.id !== id)?.id);
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
            <li>
              <button type="button" className="qb-add-question" onClick={addQuestion}>
                <Plus size={16} />
                Add New Question
              </button>
            </li>
          </ul>
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