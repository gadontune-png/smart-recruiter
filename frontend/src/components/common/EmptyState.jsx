import { Inbox } from "lucide-react";
import "./common.css";

function EmptyState({ title, description, icon, action, className = "" }) {
  return (
    <div className={`state-illustration ${className}`.trim()}>
      <div className="state-icon" aria-hidden="true">
        {icon ?? <Inbox size={40} strokeWidth={1.5} />}
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

export default EmptyState;