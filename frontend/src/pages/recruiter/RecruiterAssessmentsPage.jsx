import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, ArrowRight, Send } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { ROUTES } from "../../utils/constants";
import { assessmentService, questionService } from "../../services/assessmentService";
import "./recruiter.css";

const DIFFICULTY_TONES = { Hard: "danger", Medium: "warning", Easy: "success" };
const STATUS_TONES = { PUBLISHED: "success", ARCHIVED: "neutral", DRAFT: "warning" };

const DIFFICULTY_RANK = { Easy: 1, Medium: 2, Hard: 3 };

function deriveAssessmentDifficulty(questions) {
  if (!Array.isArray(questions) || questions.length === 0) return "Medium";
  let hardest = "Easy";
  for (const q of questions) {
    const d = q.difficulty || "Medium";
    if ((DIFFICULTY_RANK[d] || 0) > (DIFFICULTY_RANK[hardest] || 0)) {
      hardest = d;
    }
  }
  return hardest;
}

function RecruiterAssessmentsPage() {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishingId, setPublishingId] = useState(null);

  const difficulties = ["All", "Easy", "Medium", "Hard"];

  useEffect(() => {
    async function fetchAssessments() {
      try {
        setLoading(true);
        const data = await assessmentService.listMyAssessments();
        if (!Array.isArray(data)) throw new Error("Failed to fetch assessments");

        const withQuestions = await Promise.all(
          data.map(async (a) => {
            try {
              const qData = await questionService.listQuestions(
                a.assessment_id
              );
              const questions = (qData && Array.isArray(qData)) ? qData : [];
              return {
                ...a,
                questions: questions.length,
                difficulty: deriveAssessmentDifficulty(questions),
              };
            } catch {
              return { ...a, questions: 0, difficulty: "Medium" };
            }
          })
        );

        setAssessments(withQuestions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAssessments();
  }, []);

  const filtered = assessments.filter((assessment) => {
    const matchesSearch = assessment.title
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesDifficulty =
      difficulty === "All" || (assessment.difficulty || "Medium") === difficulty;
    return matchesSearch && matchesDifficulty;
  });

  const columns = ["Easy", "Medium", "Hard"].map((label) => ({
    label,
    items: filtered.filter(
      (a) => (a.difficulty || "Medium") === label
    ),
  }));

  const visibleColumns =
    difficulty === "All"
      ? columns
      : columns.filter((c) => c.label === difficulty);

  async function handlePublish(id) {
    setPublishingId(id);
    try {
      await assessmentService.publishAssessment(id);
      setAssessments((prev) =>
        prev.map((a) =>
          a.assessment_id === id ? { ...a, status: "PUBLISHED" } : a
        )
      );
    } catch (err) {
      setError(err.message || "Failed to publish assessment.");
    } finally {
      setPublishingId(null);
    }
  }

  return (
    <div className="recruiter-assessments">
      <div className="recruiter-toolbar">
        <div className="page-header">
          <p className="breadcrumb">Dashboard / Assessments</p>
          <h1>Assessments</h1>
        </div>
        <Link to={ROUTES.RECRUITER.ADD_ASSESSMENT}>
          <Button>
            <Plus size={16} />
            New Assessment
          </Button>
        </Link>
      </div>

      <div className="assessment-filters">
        <div className="filter-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search assessments..."
            aria-label="Search assessments"
          />
        </div>
        <div className="filter-pills">
          {difficulties.map((d) => (
            <button
              key={d}
              type="button"
              className={`filter-pill ${difficulty === d ? "active" : ""}`}
              onClick={() => setDifficulty(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {loading && <p>Loading assessments...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <p>No assessments found.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="assessment-columns">
          {visibleColumns.map((column) => (
            <section
              className={`assessment-column assessment-column-${column.label.toLowerCase()}`}
              key={column.label}
            >
              <div className="assessment-column-head">
                <h2 className={`assessment-column-title difficulty-${column.label.toLowerCase()}`}>
                  {column.label}
                </h2>
                <Badge variant={DIFFICULTY_TONES[column.label] || "warning"}>
                  {column.items.length}
                </Badge>
              </div>

              {column.items.length === 0 ? (
                <p className="assessment-column-empty">
                  No {column.label.toLowerCase()} assessments
                </p>
              ) : (
                <div className="assessment-column-list">
                  {column.items.map((assessment) => (
                    <div className="assessment-card panel" key={assessment.assessment_id}>
                      <div className="assessment-card-top">
                        <Badge variant={DIFFICULTY_TONES[assessment.difficulty] || "warning"}>
                          {assessment.difficulty || "Medium"}
                        </Badge>
                        <Badge variant={STATUS_TONES[assessment.status] || "neutral"}>
                          {assessment.status || "Draft"}
                        </Badge>
                      </div>

                      <h3>{assessment.title}</h3>
                      {assessment.description && (
                        <p className="assessment-meta">{assessment.description}</p>
                      )}

                      <div className="assessment-card-stats">
                        <span>
                          <strong>{assessment.questions}</strong> Questions
                        </span>
                        <span className="dot-sep">·</span>
                        <span>
                          <strong>{assessment.time_limit_minutes}</strong> mins
                        </span>
                      </div>

                      <div className="assessment-card-foot">
                        <Button
                          size="sm"
                          onClick={() => handlePublish(assessment.assessment_id)}
                          disabled={
                            assessment.status === "PUBLISHED" ||
                            assessment.questions === 0 ||
                            publishingId === assessment.assessment_id
                          }
                          title={
                            assessment.status === "PUBLISHED"
                              ? "This assessment is already published."
                              : assessment.questions === 0
                                ? "Add at least one question before publishing."
                                : "Publish this assessment."
                          }
                        >
                          <Send size={14} />
                          {assessment.status === "PUBLISHED"
                            ? "Published"
                            : publishingId === assessment.assessment_id
                              ? "Publishing..."
                              : "Publish"}
                        </Button>
                        <Link to={ROUTES.RECRUITER.GRADING} className="link-arrow">
                          View Results <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecruiterAssessmentsPage;
