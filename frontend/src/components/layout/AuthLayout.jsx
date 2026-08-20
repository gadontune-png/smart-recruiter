import { Link } from "react-router-dom";
import { APP_NAME, ROUTES } from "../../utils/constants";
import "./layout.css";

function AuthLayout({ title, subtitle, children }) {
  const isRegister = window.location.pathname === ROUTES.REGISTER;

  return (
    <div className="auth-page">
      <div className="auth-content">
        <div className="auth-inner">
          <div className="auth-header">
            <div className="auth-brand-row">
              <span className="auth-logo" aria-hidden="true">
                SR
              </span>
              <span>{APP_NAME}</span>
            </div>
            <h1>{title || "Welcome"}</h1>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          </div>

          <div className="auth-card">{children}</div>

          <p className="auth-footer">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <Link to={ROUTES.LOGIN}>Sign In</Link>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <Link to={ROUTES.REGISTER}>Sign Up</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;