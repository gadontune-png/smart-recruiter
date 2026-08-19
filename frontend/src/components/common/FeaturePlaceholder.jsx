import { Construction } from "lucide-react";
import PageHeader from "../layout/PageHeader";
import EmptyState from "./EmptyState";

function FeaturePlaceholder({ title, description, feature }) {
  return (
    <div className="container" style={{ maxWidth: "100%" }}>
      <PageHeader title={title} description={description} />
      <div className="stat-grid">
        <StatCard label="Assessments" value="0" accent="primary" />
        <StatCard label="Candidates" value="0" accent="secondary" />
        <StatCard label="Completed" value="0" accent="success" />
        <StatCard label="Avg. score" value="—" accent="info" />
      </div>
      <EmptyState
        icon={<Construction size={40} strokeWidth={1.5} />}
        title={`${feature} coming soon`}
        description="This feature is under construction by another team member."
      />
    </div>
  );
}

function StatCard({ label, value, accent = "primary" }) {
  return (
    <div className="stat-card">
      <span className={`stat-card-dot stat-dot-${accent}`} aria-hidden="true" />
      <div>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-label">{label}</div>
      </div>
    </div>
  );
}

export default FeaturePlaceholder;