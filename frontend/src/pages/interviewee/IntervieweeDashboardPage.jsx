import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { SkeletonCard } from "../../components/common/Skeleton";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import "./interviewee-dashboard.css";

function IntervieweeDashboardPage() {
  const navigate = useNavigate();

  const loading = false;
  const [error, setError] = useState(false);
  const hasAssessments = true;

  if (loading) {
  return (
    <div className="interviewee-dashboard">
      <h1>Loading your dashboard...</h1>
      <SkeletonCard lines={3} />
      <SkeletonCard lines={3} />
    </div>
  );
}

if (error) {
  return (
    <div className="interviewee-dashboard">
      <ErrorState
        title="Unable to load dashboard"
        message="We couldn't load your assessment information."
        onRetry={() => setError(false)}
      />
    </div>
  );
}

if (!hasAssessments) {
  return (
    <div className="interviewee-dashboard">
      <h1>Your Assessments</h1>

      <EmptyState
        title="No assessments yet"
        description="You don't have any assessments assigned to you yet."
      />
    </div>
  );
}
  return (
    <div className="interviewee-dashboard">
     <div className="dashboard-header">
   <div>
      <h1>Welcome back!</h1>
      <p>Here's an overview of your assessments and progress.</p>
   </div>

  <div className="profile-summary">
    <div className="profile-avatar">JD</div>

    <div>
      <strong>John Doe</strong>
      <p>Interviewee</p>
    </div>
  </div>
</div>

      <div className="dashboard-stats">
        <Card padded>
          <span>Assigned Assessments</span>
          <h2>5</h2>
        </Card>

        <Card padded>
          <span>Pending Invitations</span>
          <h2>2</h2>
        </Card>

        <Card padded>
          <span>Completed Assessments</span>
          <h2>3</h2>
        </Card>
      </div>

      <div className="dashboard-section">
        <h2>Upcoming Assessments</h2>

        <Card padded>
          <div className="assessment-card">
            <div>
              <h3>Frontend Developer Assessment</h3>
              <p>August 21, 2026 · 10:00 AM</p>
              <p>Duration: 60 minutes</p>
            </div>

            <div>
              <Badge variant="info">Upcoming</Badge>
             <Button
  size="sm"
  onClick={() => navigate("/assessment/1")}
>
  View Assessment
</Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-section">
        <h2>Recent Results</h2>

        <Card padded>
          <div className="result-card">
            <div>
              <h3>JavaScript Assessment</h3>
              <p>Completed August 17, 2026</p>
            </div>

            <div>
              <strong>85%</strong>
              <Badge variant="success">Grade A</Badge>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-section">
        <h2>Quick Actions</h2>

        <div className="quick-actions">
          <Button onClick={() => navigate("/interviewee/assessments")}>
  View Assessments
</Button>
          <Button onClick={() => navigate("/interviewee/results")} variant="secondary">
  View Results
</Button>
        </div>
      </div>

      <div className="dashboard-section">
  <h2>Assessment Status</h2>

  <div className="status-cards">
    <Card padded>
      <Badge variant="warning">Pending</Badge>
      <h3>2 Assessments</h3>
      <p>Waiting for you to start.</p>
    </Card>

    <Card padded>
      <Badge variant="info">In Progress</Badge>
      <h3>1 Assessment</h3>
      <p>Currently being completed.</p>
    </Card>

    <Card padded>
      <Badge variant="success">Completed</Badge>
      <h3>3 Assessments</h3>
      <p>Successfully submitted.</p>
    </Card>
  </div>
</div>

    </div>
  );
}

export default IntervieweeDashboardPage;
