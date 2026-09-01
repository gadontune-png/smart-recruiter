import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, ArrowRight } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { ROUTES } from "../../utils/constants";
import { assessmentService } from "../../services/assessmentService";
import "./recruiter.css";

const DIFFICULTY_TONES = { Hard: "danger", Medium: "warning", Easy: "success" };
const STATUS_TONES = { PUBLISHED: "success", ARCHIVED: "neutral", DRAFT: "warning" };

function RecruiterAssessmentsPage() {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              const qData = await assessmentService.listAssessmentQuestions(
                a.assessment_id
              );
              return { ...a, questions: (qData && qData.length) || 0 };
            } catch {
              return { ...a, questions: 0 };
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
    return matchesSearch;
  });

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
        <div className="assessment-grid">
          {filtered.map((assessment) => (
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
                <Link to={ROUTES.RECRUITER.GRADING} className="link-arrow">
                  View Results <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecruiterAssessmentsPage;
