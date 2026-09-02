import { useState, useEffect } from "react";
import { UploadCloud, Mail, UserPlus } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { Input, Select } from "../../components/forms";
import { assessmentService, invitationService } from "../../services/assessmentService";
import "./recruiter.css";
import "./recruiter-invitations.css";

const STATUS_TONES = { PENDING: "warning", ACCEPTED: "success", EXPIRED: "neutral" };

function RecruiterInvitationsPage() {
  const [filter, setFilter] = useState("All");
  const [intervieweeId, setIntervieweeId] = useState("");
  const [added, setAdded] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [loading, setLoading] = useState(false);

  const statuses = ["All", "PENDING", "ACCEPTED", "EXPIRED"];

  useEffect(() => {
    fetchInvitations();
    fetchAssessments();
  }, []);

  async function fetchInvitations() {
    try {
      const data = await invitationService.listInvitations();
      setInvitations(data);
    } catch (err) {
      console.error("Failed to fetch invitations", err);
    }
  }

  async function fetchAssessments() {
    try {
      const data = await assessmentService.listMyAssessments();
      setAssessments(data);
    } catch (err) {
      console.error("Failed to fetch assessments", err);
    }
  }

  async function handleRevoke(invitationId) {
    try {
      await invitationService.revokeInvitation(invitationId);
      setInvitations((prev) => prev.filter((inv) => inv.invitation_id !== invitationId));
    } catch (err) {
      console.error("Failed to revoke invitation", err);
    }
  }

  const rows = invitations.filter(
    (row) => filter === "All" || row.status === filter
  );

  function handleAdd() {
    if (!intervieweeId.trim()) return;
    setAdded((current) => [...current, intervieweeId.trim()]);
    setIntervieweeId("");
  }

  async function handleSendInvitation() {
    if (!selectedAssessment || added.length === 0) return;
    setLoading(true);
    try {
      for (const candidateId of added) {
        await invitationService.createInvitation({
          assessment_id: Number(selectedAssessment),
          interviewee_id: Number(candidateId),
        });
      }
      setAdded([]);
      fetchInvitations();
    } catch (err) {
      console.error("Failed to send invitations", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="recruiter-invitations">
      <div className="page-header">
        <p className="breadcrumb">Smart Recruiter / Invitations / Send Invitations</p>
        <h1>Manage Candidate Access</h1>
      </div>

      <div className="invite-columns">
        <section className="panel invite-card">
          <div className="panel-heading">
            <h2>Invite Individual Candidates</h2>
            <UserPlus size={18} className="panel-heading-icon" />
          </div>
          <div className="panel-body">
            <Select
              label="Select Assessment"
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              options={assessments.map((a) => ({
                value: a.assessment_id,
                label: a.title,
              }))}
            />
            <Input
              label="Candidate ID"
              value={intervieweeId}
              onChange={(event) => setIntervieweeId(event.target.value)}
              placeholder="e.g. 123"
            />
            <Button onClick={handleAdd}>Add</Button>
            {added.length > 0 && (
              <>
                <ul className="added-emails">
                  {added.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Button onClick={handleSendInvitation} disabled={loading}>
                  {loading ? "Sending..." : "Send Invitations"}
                </Button>
              </>
            )}
          </div>
        </section>

        <section className="panel invite-card">
          <div className="panel-heading">
            <h2>CSV Bulk Import</h2>
            <UploadCloud size={18} className="panel-heading-icon" />
          </div>
          <div className="panel-body">
            <div className="csv-dropzone">
              <UploadCloud size={28} aria-hidden="true" />
              <strong>Drag &amp; Drop your CSV file</strong>
              <span>or click to browse local files (max 10MB)</span>
              <input type="file" accept=".csv" aria-label="Upload CSV file" />
            </div>
          </div>
        </section>

        <section className="panel invite-card">
          <div className="panel-heading">
            <h2>Sent Access Log</h2>
            <Badge variant="info">{rows.length} sent</Badge>
          </div>
          <div className="panel-body">
            <div className="filter-pills log-filters">
              {statuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`filter-pill ${filter === status ? "active" : ""}`}
                  onClick={() => setFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Assessment Title</th>
                    <th>Sent Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.invitation_id}>
                      <td className="cell-strong">Candidate #{row.interviewee_id}</td>
                      <td>{assessments.find((a) => a.assessment_id === row.assessment_id)?.title || row.assessment_id}</td>
                      <td>{row.invited_at ? new Date(row.invited_at).toLocaleDateString() : "N/A"}</td>
                      <td>
                        <Badge variant={STATUS_TONES[row.status] || "neutral"}>{row.status}</Badge>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Button size="sm" variant="ghost">Resend</Button>
                          <Button size="sm" variant="ghost" className="btn-danger-text" onClick={() => handleRevoke(row.invitation_id)}>Revoke</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {selectedAssessment && (
        <section className="panel email-preview">
          <div className="panel-heading">
            <h2>Candidate Notification Preview <span className="email-tag">(Email Template)</span></h2>
            <Mail size={18} className="panel-heading-icon" />
          </div>
          <div className="panel-body">
            <div className="email-box">
              <p className="email-subject">
                <strong>Subject:</strong> You have been invited to complete a technical challenge for Smart Recruiter
              </p>
              <p className="email-greeting">Hi Candidate,</p>
              <p className="email-body">
                An engineer from our recruitment team has assigned you the {assessments.find((a) => String(a.assessment_id) === String(selectedAssessment))?.title || "Technical Challenge"}.
                This assessment evaluates your engineering fundamentals and will take approximately
                {assessments.find((a) => String(a.assessment_id) === String(selectedAssessment))?.time_limit_minutes || 60} minutes to complete. Please schedule a quiet window to focus on the challenge.
              </p>
              <Button>Start Technical Challenge</Button>
              <p className="email-note">
                Note: This invitation link is valid for 7 days. If you experience technical errors, please reach
                out to candidates@smartrecruiter.com
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default RecruiterInvitationsPage;
