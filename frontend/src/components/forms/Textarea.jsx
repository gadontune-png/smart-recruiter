import { useId } from "react";
import FormField from "./FormField";

function Textarea({
  label,
  error,
  hint,
  required = false,
  rows = 4,
  className = "",
  ...rest
}) {
  const autoId = useId();
  const fieldId = rest.id ?? autoId;

  return (
    <FormField label={label} htmlFor={fieldId} required={required} error={error} hint={hint}>
      {({ errorId, hasError }) => (
        <textarea
          id={fieldId}
          className={`textarea ${className}`.trim()}
          rows={rows}
          aria-invalid={hasError || undefined}
          aria-describedby={errorId}
          aria-label={label}
          {...rest}
        />
      )}
    </FormField>
  );
}

export default Textarea;