import "./common.css";

const VARIANTS = ["primary", "success", "warning", "danger", "info", "neutral"];

function Badge({ children, variant = "neutral", className = "", ...rest }) {
  const variantClass = VARIANTS.includes(variant) ? `badge-${variant}` : "badge-neutral";
  return (
    <span className={`badge ${variantClass} ${className}`.trim()} {...rest}>
      {children}
    </span>
  );
}

export default Badge;