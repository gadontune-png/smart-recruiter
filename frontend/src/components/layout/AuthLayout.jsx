import { Link } from "react-router-dom";
import Card from "../common/Card";
import { APP_NAME, ROUTES } from "../../utils/constants";
import "./layout.css";

function AuthLayout({ subtitle, children }) {
  const isRegister = window.location.pathname === ROUTES.REGISTER;

  return (
    <div className="auth-page">
      <div className="auth-inner">
        <div className="auth-header">
          <div className="auth-logo" aria-hidden="true">
            SR
          </div>
          <h1>{APP_NAME}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>

        <Card className="auth-card">
          {children}
        </Card>

        <p className="auth-footer">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <Link to={ROUTES.LOGIN}>Log in</Link>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <Link to={ROUTES.REGISTER}>Sign up</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default AuthLayout;