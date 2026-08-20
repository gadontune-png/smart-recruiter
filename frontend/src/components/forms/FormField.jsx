import { useId } from "react";
import "./forms.css";

function FormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
  className = "",
}) {
  const autoId = useId();
  const fieldId = htmlFor ?? autoId;
  const errorId = error ? `${fieldId}-error` : undefined;
  const hintId = hint ? `${fieldId}-hint` : undefined;

  return (
    <div className={`form-field ${className}`.trim()}>
      <label className="form-field-label" htmlFor={fieldId}>
        {label}
        {required && (
          <span className="form-field-required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {hint && (
        <span className="checkbox-hint" id={hintId}>
          {hint}
        </span>
      )}
      {children({ fieldId, errorId, hintId, hasError: Boolean(error) })}
      <span className="form-field-error" id={errorId} aria-live="polite">
        {error}
      </span>
    </div>
  );
}

export default FormField;