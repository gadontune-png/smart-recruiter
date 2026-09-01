import { API_URL } from "../utils/constants";

function getErrorMessage(error) {
  if (error && typeof error === "object") {
    if (error.detail) return error.detail;
    if (error.message) return error.message;
  }
  if (error && typeof error === "string") return error;
  return "Something went wrong. Please try again.";
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }
  return data;
}

export const assessmentService = {
  async listAssessments() {
    return request("/assessments");
  },

  async getAssessment(id) {
    return request(`/assessments/${id}`);
  },

  async createAssessment(payload) {
    return request("/assessments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async publishAssessment(id) {
    return request(`/assessments/${id}/publish`, { method: "POST" });
  },
};

export const questionService = {
  async listQuestions(assessmentId) {
    if (assessmentId) return request(`/questions?assessment_id=${assessmentId}`);
    return request("/questions");
  },

  async getQuestion(id) {
    return request(`/questions/${id}`);
  },

  async createQuestion(payload) {
    return request("/questions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateQuestion(id, payload) {
    return request(`/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deleteQuestion(id) {
    return request(`/questions/${id}`, { method: "DELETE" });
  },
};

export const submissionService = {
  async submitCode(payload) {
    return request("/submissions/code", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async runCode(submissionId) {
    return request(`/submissions/${submissionId}/run`, { method: "POST" });
  },

  async getSubmission(submissionId) {
    return request(`/submissions/${submissionId}`);
  },
};