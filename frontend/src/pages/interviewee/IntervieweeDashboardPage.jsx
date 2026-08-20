import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";

function IntervieweeDashboardPage() {
  return (
    <div className="interviewee-dashboard">
      <h1>Welcome back! </h1>
      <p>Here's an overview of your assessments and progress.</p>

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
        <Button size="sm">View Assessment</Button>
      </div>
    </div>
  </Card>
</div>

</div>
  );
}

export default IntervieweeDashboardPage;
