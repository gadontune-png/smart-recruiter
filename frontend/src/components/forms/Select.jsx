import { useId } from "react";
import FormField from "./FormField";

function Select({
  label,
  options,
  placeholder,
  error,
  hint,
  required = false,
  className = "",
  ...rest
}) {
  const autoId = useId();
  const fieldId = rest.id ?? autoId;

  return (
    <FormField label={label} htmlFor={fieldId} required={required} error={error} hint={hint}>
      {({ errorId, hasError }) => (
        <select
          id={fieldId}
          className={`select ${className}`.trim()}
          aria-invalid={hasError || undefined}
          aria-describedby={errorId}
          aria-label={label}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );
}

export default Select;