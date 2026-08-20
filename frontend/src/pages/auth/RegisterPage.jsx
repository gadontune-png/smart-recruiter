import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, Target } from "lucide-react";
import { Button, Alert } from "../../components/common";
import { Input, Radio } from "../../components/forms";
import { useAuth } from "../../hooks/useAuth";
import {
  validateEmail,
  validateMatch,
  validatePassword,
  validateRequired,
} from "../../utils/validation";
import { ROLES, ROUTES } from "../../utils/constants";

const MIN_PASSWORD_LENGTH = 6;

function RegisterPage() {
  const { registerUser, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ROLES.INTERVIEWEE,
  });
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    const { name, value, type } = event.target;
    const nextValue = type === "radio" ? value : value;
    setValues((current) => ({ ...current, [name]: nextValue }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
  }

  function validate() {
    const nextErrors = {};
    if (!validateRequired(values.name)) nextErrors.name = "Full name is required.";
    if (!validateRequired(values.email)) nextErrors.email = "Email is required.";
    else if (!validateEmail(values.email)) nextErrors.email = "Enter a valid email address.";
    if (!validateRequired(values.password)) {
      nextErrors.password = "Password is required.";
    } else if (!validatePassword(values.password, MIN_PASSWORD_LENGTH)) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters with letters and numbers.`;
    }
    if (!validateRequired(values.confirmPassword)) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (!validateMatch(values.password, values.confirmPassword)) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await registerUser({
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role,
    });

    const home =
      values.role === ROLES.RECRUITER
        ? ROUTES.RECRUITER.DASHBOARD
        : ROUTES.INTERVIEWEE.DASHBOARD;
    navigate(home, { replace: true });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="auth-form-title">Create an account</h2>
      {error && (
        <Alert variant="danger" role="alert" style={{ marginBottom: "var(--space-4)" }}>
          {error}
        </Alert>
      )}

      <Input
        label="Full name"
        name="name"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Jane Doe"
        autoComplete="name"
        required
      />

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
        autoComplete="new-password"
        hint={`At least ${MIN_PASSWORD_LENGTH} characters with a letter and a number.`}
        required
      />

      <Input
        label="Confirm password"
        name="confirmPassword"
        type="password"
        showToggle
        value={values.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="••••••••"
        autoComplete="new-password"
        required
      />

      <fieldset className="auth-role-fieldset">
        <legend className="form-field-label">I am a</legend>
        <Radio
          name="role"
          value={values.role}
          onChange={(role) =>
            setValues((current) => ({ ...current, role }))
          }
          options={[
            {
              label: "Recruiter",
              value: ROLES.RECRUITER,
              icon: <Compass size={22} />,
              hint: "Manage assessments",
            },
            {
              label: "Interviewee",
              value: ROLES.INTERVIEWEE,
              icon: <Target size={22} />,
              hint: "Take assessments",
            },
          ]}
        />
      </fieldset>

      <Button type="submit" block loading={isLoading}>
        {isLoading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}

export default RegisterPage;