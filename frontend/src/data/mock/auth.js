import { ROLES } from "../../utils/constants";

export const MOCK_USERS = [
  {
    id: "u-recruiter-1",
    name: "Recruiter Demo",
    email: "recruiter@demo.com",
    password: "secret123",
    role: ROLES.RECRUITER,
  },
  {
    id: "u-candidate-1",
    name: "Interviewee Demo",
    email: "interviewee@demo.com",
    password: "secret123",
    role: ROLES.INTERVIEWEE,
  },
];

export async function findMockUser(email, password) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (!user || user.password !== password) {
    const error = new Error("Invalid email or password.");
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}

export async function registerMockUser({ name, email, password, role }) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (
    MOCK_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase())
  ) {
    const error = new Error("An account with this email already exists.");
    error.code = "EMAIL_TAKEN";
    throw error;
  }
  const user = { id: `u-${Date.now()}`, name, email, password, role };
  MOCK_USERS.push(user);
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}