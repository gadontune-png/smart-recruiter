import { request } from "./apiClient";

export const assessmentService = {
  async listAssessments() {
    return request("/assessments");
  },

  async listMyAssessments() {
    return request("/assessments/my");
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

  async updateAssessment(id, payload) {
    return request(`/assessments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deleteAssessment(id) {
    return request(`/assessments/${id}`, { method: "DELETE" });
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

  async runCode(payload) {
    return request("/submissions/code/run", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getSubmission(submissionId) {
    return request(`/submissions/${submissionId}`);
  },
};

export const attemptService = {
  async startAttempt(assessmentId) {
    return request(`/assessments/${assessmentId}/start`, { method: "POST" });
  },

  async getQuestions(assessmentId) {
    return request(`/assessments/${assessmentId}/questions`);
  },

  async getAttempt(attemptId) {
    return request(`/attempts/${attemptId}`);
  },

  async saveAnswer(attemptId, payload) {
    return request(`/attempts/${attemptId}/answers`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getAnswers(attemptId) {
    return request(`/attempts/${attemptId}/answers`);
  },

  async submitAttempt(attemptId) {
    return request(`/attempts/${attemptId}/submit`, { method: "POST" });
  },
};

export const invitationService = {
  async listInvitations() {
    return request("/invitations");
  },

  async createInvitation(payload) {
    return request("/invitations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async createBulkInvitations(payload) {
    return request("/invitations/bulk", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async acceptInvitation(id) {
    return request(`/invitations/${id}/accept`, { method: "POST" });
  },

  async revokeInvitation(id) {
    return request(`/invitations/${id}`, { method: "DELETE" });
  },

  async declineInvitation(id) {
    return request(`/invitations/${id}/decline`, { method: "POST" });
  },
};

export const notificationService = {
  async listNotifications() {
    return request("/notifications");
  },

  async markAsRead(id) {
    return request(`/notifications/${id}/read`, { method: "PATCH" });
  },
};

export const resultService = {
  async listAssessmentResults(assessmentId) {
    return request(`/assessments/${assessmentId}/results`);
  },

  async releaseGrades(assessmentId) {
    return request(`/assessments/${assessmentId}/release-grades`, {
      method: "POST",
    });
  },
};

export const feedbackService = {
  async getFeedbackForResult(resultId) {
    return request(`/results/${resultId}/feedback`);
  },

  async createFeedback(payload) {
    return request("/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};