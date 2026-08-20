import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import PageHeader from "../../components/layout/PageHeader";
import { mockAssessments } from "../../data/mock/assessments";

function RecruiterDashboardPage() {
  const totalAssessments = mockAssessments.length;

  const publishedAssessments = mockAssessments.filter(
    (assessment) => assessment.status === "published"
  ).length;

  const draftAssessments = mockAssessments.filter(
    (assessment) => assessment.status === "draft"
  ).length;

  const totalQuestions = mockAssessments.reduce(
    (total, assessment) => total + assessment.questions.length,
    0
  );

  return (
    <div>
      <PageHeader
        title="Recruiter Dashboard"
        description="Overview of your assessments and candidates."
        actions={<Button>Create Assessment</Button>}
      />

      {/* Statistics */}
      <section className="stat-grid" aria-label="Recruiter statistics">
        <Card className="stat-card">
          <span className="stat-card-dot stat-dot-primary" />
          <div>
            <div className="stat-card-value">{totalAssessments}</div>
            <div className="stat-card-label">Total Assessments</div>
          </div>
        </Card>

        <Card className="stat-card">
          <span className="stat-card-dot stat-dot-success" />
          <div>
            <div className="stat-card-value">{publishedAssessments}</div>
            <div className="stat-card-label">Published Assessments</div>
          </div>
        </Card>

        <Card className="stat-card">
          <span className="stat-card-dot stat-dot-warning" />
          <div>
            <div className="stat-card-value">{draftAssessments}</div>
            <div className="stat-card-label">Draft Assessments</div>
          </div>
        </Card>

        <Card className="stat-card">
          <span className="stat-card-dot stat-dot-info" />
          <div>
            <div className="stat-card-value">{totalQuestions}</div>
            <div className="stat-card-label">Total Questions</div>
          </div>
        </Card>
      </section>

      {/* Main dashboard content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(16rem, 1fr)",
          gap: "var(--space-6)",
        }}
      >
        {/* Recent assessments */}
        <Card>
          <Card.Header>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-3)",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>Recent Assessments</h2>

                <p
                  style={{
                    margin: "var(--space-1) 0 0",
                    color: "var(--color-text-muted)",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  Your latest assessment activity.
                </p>
              </div>

              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </Card.Header>

          <Card.Body>
            <div style={{ display: "grid", gap: "var(--space-3)" }}>
              {mockAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "var(--space-4)",
                    padding: "var(--space-4)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "var(--font-size-base)",
                      }}
                    >
                      {assessment.title}
                    </h3>

                    <p
                      style={{
                        margin: "var(--space-1) 0 0",
                        color: "var(--color-text-muted)",
                        fontSize: "var(--font-size-sm)",
                      }}
                    >
                      {assessment.questions.length} questions ·{" "}
                      {assessment.time_limit_minutes} minutes
                    </p>
                  </div>

                  <Badge
                    variant={
                      assessment.status === "published"
                        ? "success"
                        : "warning"
                    }
                  >
                    {assessment.status === "published"
                      ? "Published"
                      : "Draft"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* Quick actions */}
        <Card>
          <Card.Header>
            <h2 style={{ margin: 0 }}>Quick Actions</h2>
          </Card.Header>

          <Card.Body>
            <div
              style={{
                display: "grid",
                gap: "var(--space-3)",
              }}
            >
              <Button block>Create Assessment</Button>

              <Button variant="secondary" block>
                Manage Questions
              </Button>

              <Button variant="outline" block>
                View Candidates
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default RecruiterDashboardPage;