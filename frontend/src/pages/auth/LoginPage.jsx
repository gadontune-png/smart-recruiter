import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button, Alert } from "../../components/common";
import { Input, Checkbox } from "../../components/forms";
import { useAuth } from "../../hooks/useAuth";
import { validateEmail, validateRequired } from "../../utils/validation";
import { ROUTES } from "../../utils/constants";

function LoginPage() {
  const { loginUser, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
  }

  function validate() {
    const nextErrors = {};
    if (!validateRequired(values.email)) nextErrors.email = "Email is required.";
    else if (!validateEmail(values.email)) nextErrors.email = "Enter a valid email address.";
    if (!validateRequired(values.password)) nextErrors.password = "Password is required.";
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const result = await loginUser(values);
    const home =
      result.payload?.role === "recruiter"
        ? ROUTES.RECRUITER.DASHBOARD
        : ROUTES.INTERVIEWEE.DASHBOARD;
    const from = location.state?.from;
    navigate(from && !from.startsWith("/login") && !from.startsWith("/register") ? from : home, {
      replace: true,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert variant="danger" role="alert" style={{ marginBottom: "var(--space-4)" }}>
          {error}
        </Alert>
      )}

      <Input
        label="Email Address"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="name@company.com"
        autoComplete="email"
        required
      />

      <Input
        label="Password"
        name="password"
        type="password"
        showToggle
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="••••••••"
        autoComplete="current-password"
        required
      />

      <div className="auth-options-row">
        <Checkbox
          name="remember"
          label="Remember me"
          checked={values.remember}
          onChange={(event) =>
            setValues((current) => ({ ...current, remember: event.target.checked }))
          }
        />
        <Link to={"/forgot-password"} className="auth-forgot">
          Forgot Password?
        </Link>
      </div>

      <Button type="submit" block loading={isLoading}>
        {isLoading ? "Signing in…" : "Sign In"}
      </Button>

      <div className="auth-divider">
        <span>OR</span>
      </div>

      <div className="auth-oauth-row">
        <Button variant="outline" block>
          <span className="google-g" aria-hidden="true">
            G
          </span>
          Google
        </Button>
        <Button variant="outline" block>
          <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M9 1.5a5.9 5.9 0 0 1 4.9 2.5A5.7 5.7 0 0 1 15 9a5.9 5.9 0 0 1-3.9 5.6c-.3.1-.4-.1-.4-.3v-1c0-.7.2-1.1-.5-1.3 1.6-.2 3.3-.8 3.3-3.6a2.8 2.8 0 0 0-.8-2A2.6 2.6 0 0 0 12.6 4.7c-.5.1-.7.2-1 .1H6.4c-.4.1-.6 0-.6 0a2.6 2.6 0 0 0-1.5 2.7c-.2-.1-.3-.3-.5-.5a2.6 2.6 0 0 1-.6-1.7h1V4A5.7 5.7 0 0 1 9 1.5ZM6 13.2c0-.1-.1-.2-.3-.1-.1 0-.2.1-.2.2 0 .2.1.2.3.2.1 0 .2-.1.2-.3Zm.7.5c0-.2-.2-.2-.4-.1-.1.1-.2.2-.1.3.1.1.3.1.4 0 .1 0 .1-.1.1-.2Zm.8.6c-.1-.1-.3-.1-.4 0s-.1.2 0 .3c.1.1.3.1.4 0 .1-.1.1-.2 0-.3Z" />
          </svg>
          GitHub
        </Button>
      </div>
    </form>
  );
}

export default LoginPage;