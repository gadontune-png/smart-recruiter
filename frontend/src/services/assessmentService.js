import { API_URL, ENABLE_MOCK } from "../utils/constants";
import { findMockUser, registerMockUser } from "../data/mock/auth";
import { findAssessments, findAssessmentById, addMockAssessment, findMockQuestions, findMockQuestionById } from "../data/mock/questions";

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  async publishAssessment(id) {
    if (ENABLE_MOCK) return { id, status: "published" };
    return request(`/assessments/${id}/publish`, { method: "POST" });
  },
};

export const questionService = {
  async listQuestions(assessmentId) {
    if (ENABLE_MOCK) {
      const questions = findMockQuestions();
      return assessmentId ? questions.filter((q) => q.assessment_id === assessmentId) : questions;
    }
    if (assessmentId) return request(`/questions?assessment_id=${assessmentId}`);
    return request("/questions");
  },

  async getQuestion(id) {
    if (ENABLE_MOCK) return findMockQuestionById(id);
    return request(`/questions/${id}`);
  },

  async createQuestion(payload) {
    if (ENABLE_MOCK) return { id: `q-${Date.now()}`, ...payload };
    return request("/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  async updateQuestion(id, payload) {
    if (ENABLE_MOCK) return { id, ...payload };
    return request(`/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  async deleteQuestion(id) {
    if (ENABLE_MOCK) return { id, deleted: true };
    return request(`/questions/${id}`, { method: "DELETE" });
  },
};

export const submissionService = {
  async submitCode(payload) {
    if (ENABLE_MOCK) return { submission_id: `sub-${Date.now()}`, status: "submitted" };
    return request("/submissions/code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  async runCode(submissionId) {
    if (ENABLE_MOCK) return { submission_id: submissionId, status: "ok" };
    return request(`/submissions/${submissionId}/run`, { method: "POST" });
  },

  async getSubmission(submissionId) {
    if (ENABLE_MOCK) return { submission_id: submissionId };
    return request(`/submissions/${submissionId}`);
  },
};