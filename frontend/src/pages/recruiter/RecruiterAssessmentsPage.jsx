import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Users, ArrowRight } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { ROUTES } from "../../utils/constants";
import "./recruiter.css";

const ASSESSMENTS = [
  { title: "Senior React Dev Challenge", difficulty: "Hard", status: "Active", questions: 12, duration: 60, invited: 42 },
  { title: "Node.js System Design Test", difficulty: "Hard", status: "Active", questions: 8, duration: 90, invited: 28 },
  { title: "DevOps Kubernetes Assessment", difficulty: "Medium", status: "Active", questions: 15, duration: 120, invited: 15 },
  { title: "Python Junior Intern Challenge", difficulty: "Easy", status: "Active", questions: 25, duration: 45, invited: 65 },
  { title: "Golang Microservices API", difficulty: "Hard", status: "Draft", questions: 10, duration: 60, invited: 12 },
  { title: "UX/UI Design Foundations", difficulty: "Easy", status: "Inactive", questions: 15, duration: 45, invited: 8 },
];

const DIFFICULTY_TONES = { Hard: "danger", Medium: "warning", Easy: "success" };
const STATUS_TONES = { Active: "success", Draft: "warning", Inactive: "neutral" };

function RecruiterAssessmentsPage() {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("All");

  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const filtered = ASSESSMENTS.filter((assessment) => {
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

      <div className="assessment-grid">
        {filtered.map((assessment) => (
          <div className="assessment-card panel" key={assessment.title}>
            <div className="assessment-card-top">
              <Badge variant={DIFFICULTY_TONES[assessment.difficulty]}>
                {assessment.difficulty}
              </Badge>
              <Badge variant={STATUS_TONES[assessment.status]}>
                {assessment.status}
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
                <strong>{assessment.duration}</strong> mins
              </span>
            </div>

            <div className="assessment-card-foot">
              <Link to={ROUTES.RECRUITER.GRADING} className="link-arrow">
                View Results <ArrowRight size={14} />
              </Link>
              <span className="assessment-invited">
                <Users size={14} />
                {assessment.invited} Invited
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecruiterAssessmentsPage;