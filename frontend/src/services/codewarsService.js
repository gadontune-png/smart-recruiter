import { API_URL } from "../utils/constants";

function getErrorMessage(error) {
  if (error && typeof error === "object") {
    if (error.detail) return error.detail;
    if (error.message) return error.message;
  }
  return "Could not find that kata.";
}

export const codewarsService = {
  async getKata(kataId) {
    const response = await fetch(`${API_URL}/codewars/katas/${kataId}`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(getErrorMessage(data));
    }
    return response.json();
  },

  async importKataAsQuestion(kataId) {
    return codewarsService.getKata(kataId);
  },
};
