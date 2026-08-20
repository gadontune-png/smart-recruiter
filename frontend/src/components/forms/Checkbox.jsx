import "./forms.css";

function Checkbox({
  label,
  name,
  checked,
  onChange,
  hint,
  disabled = false,
  className = "",
}) {
  return (
    <div className={`checkbox-group ${className}`.trim()}>
      <label className="checkbox-label">
        <input
          type="checkbox"
          className="checkbox-input"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        {label}
      </label>
      {hint && <span className="checkbox-hint">{hint}</span>}
    </div>
  );
}

export default Checkbox;