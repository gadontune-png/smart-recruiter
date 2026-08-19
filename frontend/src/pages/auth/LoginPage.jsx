import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Alert } from "../../components/common";
import { Input } from "../../components/forms";
import { useAuth } from "../../hooks/useAuth";
import { validateEmail, validateRequired } from "../../utils/validation";
import { ROUTES } from "../../utils/constants";

function LoginPage() {
  const { loginUser, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: "", password: "" });
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
      <h2 className="auth-form-title">Log in</h2>
      {error && (
        <Alert variant="danger" role="alert" style={{ marginBottom: "var(--space-4)" }}>
          {error}
        </Alert>
      )}

      <Input
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="you@example.com"
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

      <Button type="submit" block loading={isLoading}>
        {isLoading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

export default LoginPage;