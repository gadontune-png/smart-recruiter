import { request } from "./apiClient";

function getErrorMessage(error) {
  if (error && typeof error === "object") {
    if (error.detail) return error.detail;
    if (error.message) return error.message;
  }
  return "Could not find that kata.";
}

export const codewarsService = {
  async getKata(kataId) {
    try {
      return await request(`/codewars/katas/${kataId}`);
    } catch (error) {
      const message = getErrorMessage(error);
      const finalError = new Error(message);
      if (error instanceof Error) finalError.cause = error;
      throw finalError;
    }
  },

  async importKataAsQuestion(kataId) {
    return codewarsService.getKata(kataId);
  },
};