import { useState } from "react";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import PageHeader from "../../components/layout/PageHeader";

function RecruiterInvitationsPage() {
  const [invitations, setInvitations] = useState([
    {
      id: 1,
      candidate: "John Doe",
      email: "john@example.com",
      assessment: "Frontend Engineer Screen",
      status: "pending",
    },
    {
      id: 2,
      candidate: "Jane Smith",
      email: "jane@example.com",
      assessment: "Backend Engineer Screen",
      status: "accepted",
    },
  ]);

  const [candidate, setCandidate] = useState("");
  const [email, setEmail] = useState("");
  const [assessment, setAssessment] = useState("");

  const sendInvitation = (event) => {
    event.preventDefault();

    if (!candidate.trim() || !email.trim() || !assessment.trim()) return;

    setInvitations([
      ...invitations,
      {
        id: Date.now(),
        candidate: candidate.trim(),
        email: email.trim(),
        assessment: assessment.trim(),
        status: "pending",
      },
    ]);

    setCandidate("");
    setEmail("");
    setAssessment("");
  };

  return (
    <div>
      <PageHeader
        title="Invitation Management"
        description="Invite candidates to complete technical assessments."
      />

      <Card padded>
        <h2>Send Invitation</h2>

        <form
          onSubmit={sendInvitation}
          style={{
            display: "grid",
            gap: "var(--space-4)",
            maxWidth: "40rem",
          }}
        >
          <input
            value={candidate}
            onChange={(e) => setCandidate(e.target.value)}
            placeholder="Candidate name"
            required
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Candidate email"
            required
          />

          <input
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            placeholder="Assessment name"
            required
          />

          <Button type="submit">Send Invitation</Button>
        </form>
      </Card>

      <div style={{ display: "grid", gap: "var(--space-4)", marginTop: "var(--space-5)" }}>
        {invitations.map((invitation) => (
          <Card key={invitation.id}>
            <Card.Body>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "var(--space-4)",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h3 style={{ margin: 0 }}>{invitation.candidate}</h3>
                  <p>{invitation.email}</p>
                  <p style={{ marginBottom: 0 }}>
                    Assessment: {invitation.assessment}
                  </p>
                </div>

                <Badge
                  variant={
                    invitation.status === "accepted" ? "success" : "warning"
                  }
                >
                  {invitation.status}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default RecruiterInvitationsPage;