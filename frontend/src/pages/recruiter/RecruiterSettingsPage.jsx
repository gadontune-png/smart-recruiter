import { useState } from "react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { Select, Input } from "../../components/forms";
import { useAuth } from "../../hooks/useAuth";
import "../recruiter/recruiter.css";

function RecruiterSettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <div className="page-header">
        <p className="breadcrumb">Smart Recruiter / Settings</p>
        <h1>Settings</h1>
      </div>

      <div className="panel" style={{ maxWidth: "48rem" }}>
        <div className="panel-heading">
          <h2>Organization &amp; Profile</h2>
          <Badge variant="info">SysAdmin</Badge>
        </div>
        <div className="panel-body">
          <Input label="Full Name" defaultValue={user?.name || ""} />
          <Input label="Email Address" defaultValue={user?.email || ""} />
          <Select
            label="Default Difficulty Baseline"
            defaultValue="Medium"
            options={[
              { value: "Easy", label: "Easy" },
              { value: "Medium", label: "Medium" },
              { value: "Hard", label: "Hard" },
            ]}
          />
          <Button
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 3000);
            }}
          >
            Save Changes
          </Button>
          {saved && <p style={{ color: "var(--color-success)", marginTop: "var(--space-3)" }}>Settings saved.</p>}
        </div>
      </div>
    </div>
  );
}

export default RecruiterSettingsPage;