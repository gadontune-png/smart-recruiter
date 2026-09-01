import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  invitationService,
  resultService,
} from "../../services/assessmentService";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import "./interviewee-results.css";

function IntervieweeResultsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.user_id) return;
    let cancelled = false;

    invitationService
      .listInvitations()
      .then(async (invitations) => {
        const accepted = (invitations || []).filter(
          (inv) => inv.status === "ACCEPTED"
        );
        const all = [];
        for (const invitation of accepted) {
          const data = await resultService
            .listAssessmentResults(invitation.assessment_id)
            .catch(() => []);
          if (Array.isArray(data)) {
            const mine = data
              .filter(
                (r) =>
                  Number(r.interviewee_id) === Number(user.user_id) &&
                  Boolean(r.grade_released)
              )
              .map((r) => ({
                ...r,
                assessment_title:
                  r.assessment_title ||
                  invitation.title ||
                  `Assessment #${invitation.assessment_id}`,
              }));
            all.push(...mine);
          }
        }
        if (!cancelled) setResults(all);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.user_id]);

  return (
    <div className="interviewee-results">
      <div className="page-header">
        <p className="breadcrumb">Smart Recruiter / Assessment Report</p>
        <h1>My Results</h1>
        <p className="page-header-desc">
          Your assessment results will appear here once released by the recruiter.
        </p>
      </div>

      {loading ? (
        <div className="panel" style={{ padding: "var(--space-8)", textAlign: "center" }}>
          <p style={{ color: "var(--color-text-muted)" }}>Loading results...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="panel" style={{ padding: "var(--space-8)", textAlign: "center" }}>
          <h2>No results available yet</h2>
          <p style={{ color: "var(--color-text-muted)", marginTop: "var(--space-2)" }}>
            Complete an assessment to see your results here.
          </p>
          <div style={{ marginTop: "var(--space-4)" }}>
            <Button onClick={() => navigate("/interviewee/assessments")}>
              View My Assessments
            </Button>
          </div>
        </div>
      ) : (
        <div className="result-card-list">
          {results.map((result) => (
            <div className="panel result-card" key={result.id}>
              <div className="result-card-main">
                <div>
                  <h2>{result.assessment_title}</h2>
                  <p className="result-meta">
                    Completed on{" "}
                    {result.calculated_at
                      ? new Date(result.calculated_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <Badge variant="success">{Math.round(result.total_score)}%</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default IntervieweeResultsPage;