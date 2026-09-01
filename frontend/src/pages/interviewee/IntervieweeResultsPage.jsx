import "./interviewee-results.css";

function IntervieweeResultsPage() {
  return (
    <div className="interviewee-results">
      <div className="page-header">
        <p className="breadcrumb">Smart Recruiter / Assessment Report</p>
        <h1>My Results</h1>
        <p className="page-header-desc">
          Your assessment results will appear here once available.
        </p>
      </div>

      <div className="panel" style={{ padding: "var(--space-8)", textAlign: "center" }}>
        <h2>No results available yet</h2>
        <p style={{ color: "var(--color-text-muted)", marginTop: "var(--space-2)" }}>
          Complete an assessment to see your results here.
        </p>
      </div>
    </div>
  );
}

export default IntervieweeResultsPage;
