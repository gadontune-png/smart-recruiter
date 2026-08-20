export const mockAssessments = [
  {
    id: "a-1",
    recruiter_id: "u-1",
    title: "Frontend Engineer Screen",
    status: "published",
    time_limit_minutes: 60,
    published_at: "2026-08-10T09:00:00Z",
    questions: ["q-1", "q-2", "q-3"],
  },
  {
    id: "a-2",
    recruiter_id: "u-1",
    title: "Backend Engineer Screen",
    status: "draft",
    time_limit_minutes: 90,
    published_at: null,
    questions: ["q-4"],
  },
];

export const mockQuestions = [
  {
    id: "q-1",
    assessment_id: "a-1",
    type: "multiple_choice",
    prompt: "Which hook lets you memoize an expensive computation in React?",
    points: 5,
    choices: [
      { id: "c-1", choice_text: "useEffect", is_correct: false },
      { id: "c-2", choice_text: "useMemo", is_correct: true },
      { id: "c-3", choice_text: "useRef", is_correct: false },
    ],
  },
  {
    id: "q-2",
    assessment_id: "a-1",
    type: "subjective",
    prompt: "Explain the difference between controlled and uncontrolled components.",
    points: 10,
  },
  {
    id: "q-3",
    assessment_id: "a-1",
    type: "coding",
    prompt: "Write a function that reverses a linked list in place.",
    points: 20,
    source: "codewars",
    sourceId: "5900901f4f0c05de490000ea",
  },
  {
    id: "q-4",
    assessment_id: "a-2",
    type: "coding",
    prompt: "Implement an LRU cache with O(1) get/put.",
    points: 25,
  },
];

export function findAssessments() {
  return mockAssessments;
}

export function findAssessmentById(id) {
  const assessment = mockAssessments.find((a) => a.id === id);
  if (!assessment) return null;
  const questions = mockQuestions.filter((q) => q.assessment_id === id);
  return { ...assessment, questions };
}

export function addMockAssessment(payload) {

  const newAssessment = {
    id: `a-${Date.now()}`,
    status: "draft",
    questions: [],
    ...payload,
  };
  mockAssessments.push(newAssessment);
  return newAssessment;
}
