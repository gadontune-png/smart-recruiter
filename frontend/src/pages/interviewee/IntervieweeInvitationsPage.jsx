import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import "./interviewee-invitations.css";

const INVITATIONS = [
  {
    id: 1,
    title: "Frontend Developer Assessment",
    description:
      "Test your knowledge of JavaScript, React, HTML, CSS, and frontend development fundamentals.",
    date: "August 21, 2026",
    time: "10:00 AM - 11:00 AM",
    duration: "60 minutes",
    status: "Pending",
  },
  {
    id: 2,
    title: "JavaScript Technical Assessment",
    description:
      "Complete a technical assessment covering JavaScript fundamentals and problem-solving.",
    date: "August 24, 2026",
    time: "2:00 PM - 3:00 PM",
    duration: "60 minutes",
    status: "Accepted",
  },
  {
    id: 3,
    title: "React Developer Assessment",
    description:
      "Demonstrate your understanding of React components, hooks, state management, and UI development.",
    date: "August 27, 2026",
    time: "11:00 AM - 12:30 PM",
    duration: "90 minutes",
    status: "Declined",
  },
];

function IntervieweeInvitationsPage() {
  const navigate = useNavigate();

  const [invitations, setInvitations] = useState(INVITATIONS);
  const [confirmation, setConfirmation] = useState(null);

  const handleAccept = (id) => {
    setInvitations((previousInvitations) =>
      previousInvitations.map((invitation) =>
        invitation.id === id
          ? { ...invitation, status: "Accepted" }
          : invitation
      )
    );

    setConfirmation("Invitation accepted successfully.");
  };

  const handleDecline = (id) => {
    setInvitations((previousInvitations) =>
      previousInvitations.map((invitation) =>
        invitation.id === id
          ? { ...invitation, status: "Declined" }
          : invitation
      )
    );

    setConfirmation("Invitation declined.");
  };

  const getStatusVariant = (status) => {
    if (status === "Accepted") {
      return "success";
    }

    if (status === "Declined") {
      return "danger";
    }

    return "warning";
  };

  return (
    <div className="interviewee-invitations">
      <div className="invitations-header">
        <div>
          <p className="invitations-label">Interviewee Portal</p>
          <h1>Assessment Invitations</h1>
          <p>
            Review your assessment invitations and manage your upcoming
            assessments.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => navigate("/interviewee/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>

      {confirmation && (
        <div className="invitation-confirmation">
          <Badge variant="success">Success</Badge>
          <span>{confirmation}</span>
        </div>
      )}

      <div className="invitations-list">
        {invitations.length === 0 ? (
          <EmptyState
            title="No invitations"
            description="You don't have any assessment invitations at the moment."
          />
        ) : (
          invitations.map((invitation) => (
            <Card key={invitation.id} padded>
              <article className="invitation-card">
                <div className="invitation-card-header">
                  <div>
                    <p className="invitations-label">Assessment Invitation</p>
                    <h2>{invitation.title}</h2>
                  </div>

                  <Badge variant={getStatusVariant(invitation.status)}>
                    {invitation.status}
                  </Badge>
                </div>

                <p className="invitation-description">
                  {invitation.description}
                </p>

                <div className="invitation-details">
                  <div>
                    <span>Date</span>
                    <strong>{invitation.date}</strong>
                  </div>

                  <div>
                    <span>Time</span>
                    <strong>{invitation.time}</strong>
                  </div>

                  <div>
                    <span>Duration</span>
                    <strong>{invitation.duration}</strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>{invitation.status}</strong>
                  </div>
                </div>

                {invitation.status === "Pending" && (
                  <div className="invitation-actions">
                    <Button onClick={() => handleAccept(invitation.id)}>
                      Accept Invitation
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => handleDecline(invitation.id)}
                    >
                      Decline
                    </Button>
                  </div>
                )}

                {invitation.status === "Accepted" && (
                  <div className="invitation-actions">
                    <Button
                      onClick={() => navigate("/assessment/1")}
                    >
                      View Assessment
                    </Button>
                  </div>
                )}
              </article>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default IntervieweeInvitationsPage
