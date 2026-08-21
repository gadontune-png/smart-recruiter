import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import PageHeader from "../../components/layout/PageHeader";

function RecruiterResultsPage() {
  const results = [
    { id: 1, candidate: "John Doe", assessment: "Frontend Engineer Screen", score: 88, status: "Passed" },
    { id: 2, candidate: "Jane Smith", assessment: "Backend Engineer Screen", score: 72, status: "Passed" },
    { id: 3, candidate: "Alex Brown", assessment: "Frontend Engineer Screen", score: 45, status: "Failed" },
  ];

  const average =
    results.reduce((sum, result) => sum + result.score, 0) / results.length;

  return (
    <div>
      <PageHeader
        title="Results & Statistics"
        description="Review candidate performance and assessment results."
      />

      <section className="stat-grid">
        <Card className="stat-card">
          <div>
            <div className="stat-card-value">{results.length}</div>
            <div className="stat-card-label">Completed Assessments</div>
          </div>
        </Card>

        <Card className="stat-card">
          <div>
            <div className="stat-card-value">{Math.round(average)}%</div>
            <div className="stat-card-label">Average Score</div>
          </div>
        </Card>

        <Card className="stat-card">
          <div>
            <div className="stat-card-value">
              {results.filter((r) => r.status === "Passed").length}
            </div>
            <div className="stat-card-label">Passed</div>
          </div>
        </Card>

        <Card className="stat-card">
          <div>
            <div className="stat-card-value">
              {results.filter((r) => r.status === "Failed").length}
            </div>
            <div className="stat-card-label">Failed</div>
          </div>
        </Card>
      </section>

      <Card>
        <Card.Header>
          <h2 style={{ margin: 0 }}>Candidate Results</h2>
        </Card.Header>

        <Card.Body>
          <div style={{ display: "grid", gap: "var(--space-3)" }}>
            {results.map((result) => (
              <div
                key={result.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "var(--space-4)",
                  padding: "var(--space-4)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <div>
                  <h3 style={{ margin: 0 }}>{result.candidate}</h3>
                  <p style={{ marginBottom: 0 }}>{result.assessment}</p>
                </div>

                <strong>{result.score}%</strong>

                <Badge variant={result.status === "Passed" ? "success" : "danger"}>
                  {result.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default RecruiterResultsPage;