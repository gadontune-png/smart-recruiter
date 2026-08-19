import { useId, useState } from "react";
import FormField from "./FormField";

function Input({
  label,
  type = "text",
  error,
  hint,
  required = false,
  showToggle = false,
  disabled = false,
  className = "",
  ...rest
}) {
  const autoId = useId();
  const fieldId = rest.id ?? autoId;
  const [showValue, setShowValue] = useState(false);
  const isPasswordLike = showToggle && type === "password";

  return (
    <FormField label={label} htmlFor={fieldId} required={required} error={error} hint={hint}>
      {({ errorId, hasError }) => (
        <div className="input-group">
          <input
            id={fieldId}
            className={`input ${className}`.trim()}
            type={isPasswordLike ? (showValue ? "text" : "password") : type}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={errorId}
            aria-label={label}
            {...rest}
          />
          {isPasswordLike && (
            <button
              type="button"
              className="input-toggle"
              onClick={() => setShowValue((value) => !value)}
              aria-label={showValue ? "Hide password" : "Show password"}
              title={showValue ? "Hide password" : "Show password"}
            >
              {showValue ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
                  <path d="M17.9 17.9A10.9 10.9 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}
    </FormField>
  );
}

export default Input;