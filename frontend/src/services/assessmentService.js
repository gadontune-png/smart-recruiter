import { API_URL, ENABLE_MOCK } from "../utils/constants";
import {
  findAssessments,
  findAssessmentById,
  addMockAssessment,
} from "../data/mock/assessments";

function getErrorMessage(error) {
  let message = "Something went wrong. Please try again.";
  if (error && typeof error === "object" && error.message) {
    message = error.message;
  }
  return message;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(getErrorMessage(data));
  }
  return response.json();
}

export const assessmentService = {
  async listAssessments() {
    if (ENABLE_MOCK) return findAssessments();
    return request("/assessments");
  },

  async getAssessment(id) {
    if (ENABLE_MOCK) return findAssessmentById(id);
    return request(`/assessments/${id}`);
  },

  async createAssessment(payload) {
    if (ENABLE_MOCK) return addMockAssessment(payload);
    return request("/assessments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async publishAssessment(id) {
    if (ENABLE_MOCK) return { id, status: "published" };
    return request(`/assessments/${id}/publish`, { method: "POST" });
  },
};
