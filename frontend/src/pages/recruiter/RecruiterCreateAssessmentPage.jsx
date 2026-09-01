import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Button from "../../components/common/Button";
import { Input, Textarea } from "../../components/forms";
import { assessmentService } from "../../services/assessmentService";
import { ROUTES } from "../../utils/constants";
import "./recruiter.css";

function RecruiterCreateAssessmentPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("60");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Assessment title is required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const created = await assessmentService.createAssessment({
        title: title.trim(),
        description: description.trim() || null,
        time_limit_minutes: parseInt(timeLimit, 10) || 60,
      });
      if (created && created.assessment_id) {
        navigate(`/recruiter/questions`);
      } else {
        navigate(ROUTES.RECRUITER.ASSESSMENTS);
      }
    } catch (err) {
      setError(err.message || "Failed to create assessment");
      setBusy(false);
    }
  }

  return (
    <div className="recruiter-assessments">
      <div className="recruiter-toolbar">
        <div className="page-header">
          <p className="breadcrumb">Dashboard / Assessments / New</p>
          <h1>Create Assessment</h1>
        </div>
        <Link to={ROUTES.RECRUITER.ASSESSMENTS}>
          <Button variant="secondary">
            <ArrowLeft size={16} />
            Back to Assessments
          </Button>
        </Link>
      </div>

      <form className="panel" style={{ maxWidth: 640 }} onSubmit={handleSubmit}>
        <div className="panel-body">
          <Input
            label="Assessment Title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Senior Frontend Developer Screening"
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Briefly describe what this assessment covers..."
            rows={4}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Input
              label="Time Limit (minutes)"
              type="number"
              min="1"
              value={timeLimit}
              onChange={(event) => setTimeLimit(event.target.value)}
            />
          </div>

          {error && <p style={{ color: "#c00", fontSize: "0.875rem" }}>{error}</p>}

          <div className="qb-editor-actions">
            <Link to={ROUTES.RECRUITER.ASSESSMENTS}>
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="spin-icon" size={16} /> : <Check size={16} />}
              Create Assessment
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default RecruiterCreateAssessmentPage;