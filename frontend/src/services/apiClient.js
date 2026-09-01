import { API_URL } from "../utils/constants";
import { STORAGE_KEYS } from "../utils/constants";

export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.access_token) return parsed;
    if (parsed && parsed.user) return { access_token: parsed.token, user: parsed };
    return parsed;
  } catch {
    return null;
  }
}

export function getToken() {
  const auth = getStoredAuth();
  return auth?.access_token || auth?.token || null;
}

export function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getErrorMessage(error) {
  if (error && typeof error === "object") {
    if (error.detail) return error.detail;
    if (error.message) return error.message;
  }
  if (error && typeof error === "string") return error;
  return "Something went wrong. Please try again.";
}

export async function request(path, options = {}) {
  const { headers = {}, ...rest } = options;
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...headers,
    },
    ...rest,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = getErrorMessage(data);
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}