import { TriangleAlert } from "lucide-react";
import Alert from "./Alert";

function ErrorState({ title = "Something went wrong", message, onRetry, className = "" }) {
  return (
    <div className={`state-illustration ${className}`.trim()}>
      <div className="state-icon" aria-hidden="true">
        <TriangleAlert size={40} strokeWidth={1.5} />
      </div>
      <h3>{title}</h3>
      <Alert variant="danger">{message}</Alert>
      {onRetry && <button onClick={onRetry} className="btn btn-secondary">Try again</button>}
    </div>
  );
}

export default ErrorState;