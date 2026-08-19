import "./common.css";

const VARIANTS = ["success", "warning", "danger", "info"];

function Alert({ children, variant = "info", role = "alert", className = "", ...rest }) {
  const variantClass = VARIANTS.includes(variant) ? `alert-${variant}` : "alert-info";
  return (
    <div role={role} className={`alert ${variantClass} ${className}`.trim()} {...rest}>
      <span className="alert-icon" aria-hidden="true">
        {ICONS[variant] ?? ICONS.info}
      </span>
      <div className="alert-content">{children}</div>
    </div>
  );
}

const ICONS = {
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path fillRule="evenodd" d="M8.2 2.9a2 2 0 0 1 3.6 0l6.5 12A2 2 0 0 1 16.5 18h-13a2 2 0 0 1-1.8-3.1l6.5-12zM10 6a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V7a1 1 0 0 0-1-1zm0 8a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 10 14z" clipRule="evenodd" />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.3 6.9a1 1 0 0 0-1.4 1.4L8.6 10l-1.7 1.7a1 1 0 1 0 1.4 1.4L10 11.4l1.7 1.7a1 1 0 0 0 1.4-1.4L11.4 10l1.7-1.7a1 1 0 0 0-1.4-1.4L10 8.6 8.3 6.9z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM9 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm1 2a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1z" clipRule="evenodd" />
    </svg>
  ),
};

export default Alert;