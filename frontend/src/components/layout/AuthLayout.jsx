import { Link } from "react-router-dom";
import { CheckCircle2, Sparkles } from "lucide-react";
import { APP_NAME, ROUTES } from "../../utils/constants";
import "./layout.css";

const BRAND_POINTS = [
  "Automated technical assessments with live coding",
  "AI-powered grading and instant candidate feedback",
  "Actionable analytics to hire top talent faster",
];

function AuthLayout({ title, subtitle, children }) {
  const isRegister = window.location.pathname === ROUTES.REGISTER;

  return (
    <div className="auth-page">
      <aside className="auth-brand-panel">
        <div className="auth-brand-logo">
          <span className="auth-logo auth-logo-lg" aria-hidden="true">
            SR
          </span>
          <span>{APP_NAME}</span>
        </div>

        <div className="auth-brand-copy">
          <span className="auth-brand-kicker">
            <Sparkles size={14} aria-hidden="true" />
            The next-generation talent engine
          </span>
          <h2 className="auth-brand-title">
            Assess skills.
            <br />
            Match talent.
            <br />
            Hire better.
          </h2>
          <ul className="auth-brand-points">
            {BRAND_POINTS.map((point) => (
              <li key={point}>
                <CheckCircle2 size={16} aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="auth-brand-foot">
          <blockquote className="auth-brand-quote">
            &ldquo;We cut screening time in half with smarter,
            code-first assessments.&rdquo;
            <small>— The Smart Recruiter Team</small>
          </blockquote>
        </div>
      </aside>

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