import { API_URL } from "../utils/constants";

function getErrorMessage(error) {
  if (error && typeof error === "object") {
    if (error.detail) return error.detail;
    if (error.message) return error.message;
  }
  if (error && typeof error === "string") return error;
  return "Something went wrong. Please try again.";
}

export const authService = {
  async login({ email, password }) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getErrorMessage(data));
    }
    return data.user;
  },

  async register({ name, email, password, role }) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: name, email, password, role }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(getErrorMessage(data));
    }
    return data.user;
  },
};