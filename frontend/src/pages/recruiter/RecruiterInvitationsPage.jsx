import { useState } from "react";
import { UploadCloud, Mail, UserPlus } from "lucide-react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { Input, Select } from "../../components/forms";
import "./recruiter.css";
import "./recruiter-invitations.css";

const SENT_LOG = [
  { email: "dev.candidate@gmail.com", assessment: "Senior React Developer Challenge", date: "Oct 24, 2026", status: "Pending" },
  { email: "systems.architect@outlook.com", assessment: "Node.js System Design Test", date: "Oct 23, 2026", status: "Accepted" },
  { email: "junior.intern@university.edu", assessment: "Python Junior Intern Assessment", date: "Oct 15, 2026", status: "Expired" },
];

const STATUS_TONES = { Pending: "warning", Accepted: "success", Expired: "neutral" };

function RecruiterInvitationsPage() {
  const [filter, setFilter] = useState("All");
  const [email, setEmail] = useState("");
  const [added, setAdded] = useState([]);

  const statuses = ["All", "Pending", "Accepted", "Expired"];

  const rows = SENT_LOG.filter(
    (row) => filter === "All" || row.status === filter
  );

  function handleAdd() {
    if (!email.trim()) return;
    setAdded((current) => [...current, email.trim()]);
    setEmail("");
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
              value="Senior React Developer Challenge"
              options={[
                { value: "Senior React Developer Challenge", label: "Senior React Developer Challenge" },
                { value: "Node.js System Design Test", label: "Node.js System Design Test" },
                { value: "Python Junior Intern Assessment", label: "Python Junior Intern Assessment" },
              ]}
            />
            <Input
              label="Candidate Email Address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="enter-candidate-email@company.com"
            />
            <Button onClick={handleAdd}>Add</Button>
            {added.length > 0 && (
              <ul className="added-emails">
                {added.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
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
                    <th>Email Address</th>
                    <th>Assessment Title</th>
                    <th>Sent Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.email}>
                      <td className="cell-strong">{row.email}</td>
                      <td>{row.assessment}</td>
                      <td>{row.date}</td>
                      <td>
                        <Badge variant={STATUS_TONES[row.status]}>{row.status}</Badge>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Button size="sm" variant="ghost">Resend</Button>
                          <Button size="sm" variant="ghost" className="btn-danger-text">Revoke</Button>
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
              An engineer from our recruitment team has assigned you the Senior React Developer Challenge.
              This assessment evaluates your front-end engineering fundamentals and will take approximately
              60 minutes to complete. Please schedule a quiet window to focus on the challenge.
            </p>
            <Button>Start Technical Challenge</Button>
            <p className="email-note">
              Note: This invitation link is valid for 7 days. If you experience technical errors, please reach
              out to candidates@smartrecruiter.com
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default RecruiterInvitationsPage;