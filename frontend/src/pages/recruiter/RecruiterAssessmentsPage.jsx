import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import PageHeader from "../../components/layout/PageHeader";
import {
  fetchAssessments,
  createAssessment,
  publishAssessment,
} from "../../features/assessments/assessmentSlice";

function RecruiterAssessmentsPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.assessments);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);

  useEffect(() => {
    dispatch(fetchAssessments());
  }, [dispatch]);

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!title.trim()) return;

    await dispatch(
      createAssessment({
        recruiter_id: "u-1",
        title: title.trim(),
        time_limit_minutes: Number(timeLimit),
      })
    );

    setTitle("");
    setTimeLimit(60);
    setShowForm(false);
  };

  const handlePublish = (id) => {
    dispatch(publishAssessment(id));
  };

  return (
    <div>
      <PageHeader
        title="Assessments"
        description="Create, edit, publish and manage technical assessments."
        actions={
          <Button onClick={() => setShowForm((value) => !value)}>
            {showForm ? "Cancel" : "Create Assessment"}
          </Button>
        }
      />

      {showForm && (
        <Card padded>
          <h2>Create Assessment</h2>

          <form
            onSubmit={handleCreate}
            style={{
              display: "grid",
              gap: "var(--space-4)",
              maxWidth: "32rem",
            }}
          >
            <label>
              Assessment title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. React Developer Assessment"
                required
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "var(--space-2)",
                  padding: "var(--space-3)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                }}
              />
            </label>

            <label>
              Time limit (minutes)
              <input
                type="number"
                min="1"
                value={timeLimit}
                onChange={(event) => setTimeLimit(event.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: "var(--space-2)",
                  padding: "var(--space-3)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                }}
              />
            </label>

            <Button type="submit">Create Assessment</Button>
          </form>
        </Card>
      )}

      {status === "loading" && <p>Loading assessments...</p>}

      {error && (
        <p role="alert" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}

      {status !== "loading" && items.length === 0 && (
        <Card padded>
          <h2>No assessments yet</h2>
          <p>Create your first technical assessment.</p>
        </Card>
      )}

      <div
        style={{
          display: "grid",
          gap: "var(--space-4)",
          marginTop: "var(--space-5)",
        }}
      >
        {items.map((assessment) => (
          <Card key={assessment.id}>
            <Card.Body>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "var(--space-4)",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>{assessment.title}</h2>

                  <p
                    style={{
                      color: "var(--color-text-muted)",
                      marginBottom: 0,
                    }}
                  >
                    {assessment.questions?.length ?? 0} questions ·{" "}
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
            </Card.Body>

            <Card.Footer>
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-2)",
                  flexWrap: "wrap",
                }}
              >
                {assessment.status === "draft" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handlePublish(assessment.id)}
                  >
                    Publish
                  </Button>
                )}

                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </Card.Footer>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default RecruiterAssessmentsPage;