import { useState } from "react";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { Input } from "../../components/forms";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import "../recruiter/recruiter.css";

function RecruiterSettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload = {};
      if (fullName && fullName !== user?.full_name) payload.full_name = fullName;
      if (newPassword) {
        if (!currentPassword) {
          setError("Current password is required to change password.");
          setSaving(false);
          return;
        }
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }
      if (Object.keys(payload).length === 0) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setSaving(false);
        return;
      }
      const updated = await authService.updateProfile(payload);
      if (updated?.full_name) {
        localStorage.setItem(
          "sr_auth",
          JSON.stringify({
            ...JSON.parse(localStorage.getItem("sr_auth") || "{}"),
            user: { ...user, full_name: updated.full_name },
          })
        );
      }
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <p className="breadcrumb">Smart Recruiter / Settings</p>
        <h1>Settings</h1>
      </div>

      <div className="panel" style={{ maxWidth: "48rem" }}>
        <div className="panel-heading">
          <h2>Organization &amp; Profile</h2>
          <Badge variant="info">Recruiter</Badge>
        </div>
        <div className="panel-body">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input label="Email Address" value={user?.email || ""} disabled />
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Required to change password"
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Leave blank to keep current"
          />
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          {saved && (
            <p style={{ color: "var(--color-success)", marginTop: "var(--space-3)" }}>
              Settings saved.
            </p>
          )}
          {error && (
            <p style={{ color: "var(--color-danger)", marginTop: "var(--space-3)" }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecruiterSettingsPage;
