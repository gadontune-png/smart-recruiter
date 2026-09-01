export const mockQuestions = [
  {
    id: "q-1",
    assessment_id: "a-1",
    question_text: "Which hook lets you memoize an expensive computation in React?",
    question_type: "multiple_choice",
    points: 5,
    order_number: 1,
    choices: [
      { id: "c-1", option_text: "useEffect", is_correct: false },
      { id: "c-2", option_text: "useMemo", is_correct: true },
      { id: "c-3", option_text: "useRef", is_correct: false },
    ],
  },
  {
    id: "q-2",
    assessment_id: "a-1",
    question_text: "Explain the difference between controlled and uncontrolled components.",
    question_type: "subjective",
    points: 10,
    order_number: 2,
  },
  {
    id: "q-3",
    assessment_id: "a-1",
    question_text: "Write a function that reverses a linked list in place.",
    question_type: "coding",
    points: 20,
    order_number: 3,
    source: "codewars",
    sourceId: "5900901f4f0c05de490000ea",
    starter_code: "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode} head\n * @return {ListNode}\n */\nvar reverseList = function(head) {\n    \n};",
    language: "javascript",
  },
  {
    id: "q-4",
    assessment_id: "a-2",
    question_text: "Implement an LRU cache with O(1) get/put operations.",
    question_type: "coding",
    points: 25,
    order_number: 1,
    starter_code: "/**\n * @param {number} capacity\n */\nvar LRUCache = function(capacity) {\n    \n};\n\n/** \n * @param {number} key\n * @return {number}\n */\nLRUCache.prototype.get = function(key) {\n    \n};\n\n/** \n * @param {number} key \n * @param {number} value\n * @return {void}\n */\nLRUCache.prototype.put = function(key, value) {\n    \n};\n\n/** \n * Your LRUCache object will be instantiated and called as such:\n * var obj = new LRUCache(capacity)\n * var param_1 = obj.get(key)\n * var param_2 = obj.put(key,value)\n */",
    language: "javascript",
  },
  {
    id: "q-5",
    assessment_id: "a-2",
    question_text: "Given an array of integers, find the contiguous subarray with the largest sum.",
    question_type: "coding",
    points: 15,
    order_number: 2,
    starter_code: "/**\n * @param {number[]} nums\n * @return {number}\n */\nvar maxSubArray = function(nums) {\n    \n};",
    language: "javascript",
  },
  {
    id: "q-6",
    assessment_id: "a-2",
    question_text: "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.",
    question_type: "coding",
    points: 20,
    order_number: 3,
    starter_code: "/**\n * initialize your data structure here.\n */\nvar MinStack = function() {\n    \n};\n\n/** \n * @param {number} val\n * @return {void}\n */\nMinStack.prototype.push = function(val) {\n    \n};\n\n/**\n * @return {void}\n */\nMinStack.prototype.pop = function() {\n    \n};\n\n/**\n * @return {number}\n */\nMinStack.prototype.top = function() {\n    \n};\n\n/**\n * @return {number}\n */\nMinStack.prototype.getMin = function() {\n    \n};\n\n/** \n * Your MinStack object will be instantiated and called as such:\n * var obj = new MinStack()\n * obj.push(val)\n * obj.pop()\n * var param_1 = obj.top()\n * var param_2 = obj.getMin()\n */",
    language: "javascript",
  },
];

export function findAssessments() {
  return [
    {
      id: "a-1",
      recruiter_id: "u-1",
      title: "Frontend Engineer Screen",
      status: "published",
      time_limit_minutes: 60,
      published_at: "2026-08-10T09:00:00Z",
      questions: ["q-1", "q-2", "q-3", "q-5"],
    },
    {
      id: "a-2",
      recruiter_id: "u-1",
      title: "Backend Engineer Screen",
      status: "draft",
      time_limit_minutes: 90,
      published_at: null,
      questions: ["q-4", "q-6"],
    },
  ];
}

export function findAssessmentById(id) {
  const assessment = findAssessments().find((a) => a.id === id);
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
  const allAssessments = findAssessments();
  allAssessments.push(newAssessment);
  return newAssessment;
}

export function findMockQuestions() {
  return mockQuestions;
}

export function findMockQuestionById(id) {
  return mockQuestions.find((q) => q.id === id) || null;
}