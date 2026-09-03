import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  resultService,
  feedbackService,
} from "../../services/assessmentService";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import "./interviewee-results.css";

function IntervieweeResultsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.user_id) return;
    let cancelled = false;

    resultService
      .listMyResults()
      .then(async (data) => {
        const all = Array.isArray(data) ? data : [];
        if (!cancelled) setResults(all);

        const fbMap = {};
        for (const r of all) {
          const fb = await feedbackService
            .getFeedbackForResult(r.id)
            .catch(() => []);
          if (Array.isArray(fb) && fb.length > 0) {
            const seen = new Set();
            fbMap[r.id] = fb.filter((item) => {
              const key = item.answer_id ?? item.feedback_id;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          }
        }
        if (!cancelled) setFeedbackMap(fbMap);
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
          {results.map((result) => {
            const score = Math.round(result.total_score);
            const feedbackItems = feedbackMap[result.id] || [];
            return (
              <div className="panel result-card" key={result.id}>
                <div className="result-card-head">
                  <div className="result-card-title">
                    <h2>{result.assessment_title}</h2>
                    <p className="result-meta">
                      Completed on{" "}
                      {result.calculated_at
                        ? new Date(result.calculated_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div
                    className="score-circle score-tiny"
                    style={{ "--score": `${score}%` }}
                  >
                    <div className="score-circle-inner">
                      <strong>{score}%</strong>
                      <span>Score</span>
                    </div>
                  </div>
                </div>

                <div className="result-status-row">
                  <div className="result-grade-badge">
                    <Badge variant={score >= 60 ? "success" : "danger"}>
                      {score >= 60 ? "Passed" : "Failed"}
                    </Badge>
                  </div>
                  <span className="result-reviewed-tag">Reviewed &amp; graded by recruiter</span>
                </div>

                {feedbackItems.length > 0 && (
                  <div className="result-feedback">
                    <div className="result-feedback-head">
                      <h3>Recruiter Feedback</h3>
                    </div>
                    {feedbackItems.map((fb) => (
                      <div className="feedback-block" key={fb.feedback_id}>
                        <p className="feedback-comment">{fb.comment}</p>
                        {fb.score != null && (
                          <div className="feedback-score">
                            <Badge variant="info">Score {fb.score}</Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {feedbackItems.length === 0 && (
                  <p className="result-no-feedback">
                    No written feedback from the recruiter.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default IntervieweeResultsPage;
