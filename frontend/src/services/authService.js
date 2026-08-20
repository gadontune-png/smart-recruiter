import { API_URL, ENABLE_MOCK } from "../utils/constants";
import { findMockUser, registerMockUser } from "../data/mock/auth";

function getErrorMessage(error) {
  let message = "Something went wrong. Please try again.";
  if (error && typeof error === "object" && error.message) {
    message = error.message;
  }
  return message;
}

export const authService = {
  async login({ email, password }) {
    if (ENABLE_MOCK) {
      return findMockUser(email, password);
    }
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(getErrorMessage(data));
    }
    return response.json();
  },

  async register({ name, email, password, role }) {
    if (ENABLE_MOCK) {
      return registerMockUser({ name, email, password, role });
    }
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(getErrorMessage(data));
    }
    return response.json();
  },
};