import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Users, ArrowRight } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { ROUTES, API_URL } from "../../utils/constants";
import "./recruiter.css";

const DIFFICULTY_TONES = { Hard: "danger", Medium: "warning", Easy: "success" };
const STATUS_TONES = { Active: "success", Published: "success", Draft: "warning", Inactive: "neutral" };

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
        const res = await fetch(`${API_URL}/assessments/my`);
        if (!res.ok) throw new Error("Failed to fetch assessments");
        const data = await res.json();

        const withQuestions = await Promise.all(
          data.map(async (a) => {
            try {
              const qRes = await fetch(`${API_URL}/assessments/${a.assessment_id}/questions`);
              if (!qRes.ok) return { ...a, questions: 0 };
              const qData = await qRes.json();
              return { ...a, questions: qData.length || 0 };
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
    const matchesDifficulty =
      difficulty === "All" || assessment.difficulty === difficulty;
    return matchesSearch && matchesDifficulty;
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
              <p className="assessment-meta">Created by System Admin</p>

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
                <span className="assessment-invited">
                  <Users size={14} />
                  N/A
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecruiterAssessmentsPage;
