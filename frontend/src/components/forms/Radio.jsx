import "./forms.css";

function Radio({ name, options, value, onChange, disabled = false, className = "" }) {
  return (
    <div className={`radio-group ${className}`.trim()} role="radiogroup">
      {options.map((option) => (
        <label key={option.value} className="radio-label">
          <input
            type="radio"
            className="radio-input"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
            disabled={disabled}
          />
          {option.icon && (
            <span className="radio-icon" aria-hidden="true">
              {option.icon}
            </span>
          )}
          <span>
            {option.label}
            {option.hint && (
              <>
                <br />
                <span className="radio-hint">{option.hint}</span>
              </>
            )}
          </span>
        </label>
      ))}
    </div>
  );
}

export default Radio;