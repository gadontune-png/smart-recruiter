import { request } from "./apiClient";

export const authService = {
  async login({ email, password }) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return data;
  },

  async register({ name, email, password, role }) {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name: name, email, password, role }),
    });
    return data;
  },

  async getMe() {
    return request("/auth/me");
  },

  async updateProfile(payload) {
    return request("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};