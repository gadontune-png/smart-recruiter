const CODEWARS_BASE_URL = "https://www.codewars.com/api/v1";

function getErrorMessage(error) {
  let message = "Could not find that kata.";
  if (error && typeof error === "object" && error.message) {
    message = error.message;
  }
  return message;
}

export const codewarsService = {
  async getKata(kataId) {
    const response = await fetch(`${CODEWARS_BASE_URL}/code-challenges/${kataId}`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(getErrorMessage(data));
    }
    return response.json();
  },

  async importKataAsQuestion(kataId) {
    const kata = await codewarsService.getKata(kataId);
    return {
      type: "coding",
      prompt: kata.description,
      title: kata.name,
      difficulty: kata.rank?.name || "unknown",
      languages: kata.languages || [],
      source: "codewars",
      sourceId: kata.id,
      sourceUrl: kata.url,
      tags: kata.tags || [],
    };
  },
};
