import "./common.css";

const VARIANTS = ["primary", "secondary", "outline", "danger", "ghost"];
const SIZES = ["sm", "md", "lg"];

function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  block = false,
  loading = false,
  disabled = false,
  className = "",
  ariaLabel,
  ...rest
}) {
  const variantClass = VARIANTS.includes(variant) ? `btn-${variant}` : "btn-primary";
  const sizeClass = SIZES.includes(size) ? `btn-${size}` : "";
  const blockClass = block ? "btn-block" : "";

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${blockClass} ${className}`.trim()}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading || undefined}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

function Spinner({ size = "md", label = "Loading" }) {
  const sizeClass = size === "sm" ? "spinner-sm" : size === "lg" ? "spinner-lg" : "";
  return (
    <span
      className={`spinner ${sizeClass}`.trim()}
      role="status"
      aria-label={label}
      aria-live="polite"
    />
  );
}

export { Button, Spinner };
export default Button;