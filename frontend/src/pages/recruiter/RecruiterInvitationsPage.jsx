import { useState, useEffect } from "react";
import { UploadCloud, Mail, X } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { Input, Select } from "../../components/forms";
import { assessmentService, invitationService } from "../../services/assessmentService";
import "./recruiter.css";
import "./recruiter-invitations.css";

const STATUS_TONES = { PENDING: "warning", ACCEPTED: "success", EXPIRED: "neutral" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RecruiterInvitationsPage() {
  const [filter, setFilter] = useState("All");
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [bulkEmailsText, setBulkEmailsText] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  function handleAddEmail() {
    const value = emailInput.trim();
    if (!value) return;
    if (!EMAIL_RE.test(value)) {
      setError(`"${value}" is not a valid email address.`);
      return;
    }
    setError("");
    if (emails.includes(value.toLowerCase())) {
      setEmailInput("");
      return;
    }
    setEmails((current) => [...current, value.toLowerCase()]);
    setEmailInput("");
  }

  function handleAddBulkEmails() {
    const text = bulkEmailsText.trim();
    if (!text) return;
    const parsed = text
      .split(/[\s,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const valid = parsed.filter((e) => EMAIL_RE.test(e));
    const invalid = parsed.filter((e) => !EMAIL_RE.test(e));
    if (invalid.length) {
      setError(`Invalid email(s): ${invalid.join(", ")}`);
    } else {
      setError("");
    }
    setEmails((current) => Array.from(new Set([...current, ...valid])));
    setBulkEmailsText("");
  }

  function handleRemoveEmail(email) {
    setEmails((current) => current.filter((e) => e !== email));
  }

  async function handleSendEmails() {
    setError("");
    setSuccess("");
    if (!selectedAssessment) {
      setError("Please select an assessment first.");
      return;
    }
    if (emails.length === 0) {
      setError("Add at least one candidate email before sending.");
      return;
    }
    setLoading(true);
    try {
      const created = await invitationService.createEmailBulkInvitations({
        assessment_id: Number(selectedAssessment),
        emails,
      });
      setEmails([]);
      const count = Array.isArray(created) ? created.length : emails.length;
      setSuccess(`${count} invitation${count === 1 ? "" : "s"} sent successfully.`);
      fetchInvitations();
    } catch (err) {
      setError(err.message || "Failed to send invitations.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="recruiter-invitations">
      <div className="page-header">
        <p className="breadcrumb">Smart Recruiter / Invitations / Send Invitations</p>
      </div>

      <div className="invite-columns">
        <section className="panel invite-card">
          <div className="panel-heading">
            <h2>Manage Candidate Access</h2>
            <Mail size={18} className="panel-heading-icon" />
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
            <div className="email-add-row">
              <Input
                label="Candidate Email"
                type="email"
                value={emailInput}
                onChange={(event) => setEmailInput(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
                placeholder="candidate@example.com"
              />
              <Button variant="secondary" onClick={handleAddEmail}>
                Add
              </Button>
            </div>

            <div className="bulk-emails">
              <label className="form-label">Or paste multiple emails</label>
              <textarea
                className="bulk-emails-textarea"
                value={bulkEmailsText}
                onChange={(e) => setBulkEmailsText(e.target.value)}
                placeholder="candidate1@example.com, candidate2@example.com, candidate3@example.com"
                rows={3}
              />
              <Button size="sm" variant="ghost" onClick={handleAddBulkEmails}>
                Add All
              </Button>
            </div>

            {error && <p className="invite-error">{error}</p>}
            {success && <p className="invite-success">{success}</p>}

            {emails.length > 0 && (
              <>
                <ul className="added-emails">
                  {emails.map((item) => (
                    <li key={item} className="email-chip">
                      <span>{item}</span>
                      <button
                        type="button"
                        className="email-chip-remove"
                        aria-label={`Remove ${item}`}
                        onClick={() => handleRemoveEmail(item)}
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
                <Button onClick={handleSendEmails} disabled={loading}>
                  {loading ? "Sending..." : `Send ${emails.length} Invitation${emails.length > 1 ? "s" : ""}`}
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

        <section className="panel invite-card log-card">
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
                      <td className="cell-strong">
                        {row.interviewee_name || row.interviewee_email || `Candidate #${row.interviewee_id}`}
                        {row.interviewee_email && row.interviewee_email !== row.interviewee_name && (
                          <div className="cell-sub">{row.interviewee_email}</div>
                        )}
                      </td>
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
    </div>
  );
}

export default RecruiterInvitationsPage;
