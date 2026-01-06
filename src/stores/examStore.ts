import { create } from "zustand";
import type { ExamAttempt, Question, AttemptResponse } from "@/api/types";

interface ExamState {
  // Current attempt
  currentAttempt: ExamAttempt | null;
  questions: Question[];
  responses: Map<string, AttemptResponse>;

  // Navigation
  currentQuestionIndex: number;

  // Timer
  timeRemaining: number | null; // in seconds, null if no time limit
  timerRunning: boolean;

  // Actions
  startExam: (attempt: ExamAttempt, questions: Question[], timeLimit?: number) => void;
  setCurrentQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitResponse: (questionId: string, response: AttemptResponse) => void;
  updateTimeRemaining: (seconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  clearExam: () => void;

  // Getters (computed)
  getCurrentQuestion: () => Question | null;
  getProgress: () => { answered: number; total: number; percentage: number };
  isQuestionAnswered: (questionId: string) => boolean;
}

const initialState = {
  currentAttempt: null,
  questions: [],
  responses: new Map<string, AttemptResponse>(),
  currentQuestionIndex: 0,
  timeRemaining: null,
  timerRunning: false,
};

export const useExamStore = create<ExamState>()((set, get) => ({
  ...initialState,

  startExam: (attempt, questions, timeLimit) =>
    set({
      currentAttempt: attempt,
      questions,
      responses: new Map(),
      currentQuestionIndex: 0,
      timeRemaining: timeLimit ? timeLimit * 60 : null, // Convert minutes to seconds
      timerRunning: true,
    }),

  setCurrentQuestion: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  submitResponse: (questionId, response) =>
    set((state) => {
      const newResponses = new Map(state.responses);
      newResponses.set(questionId, response);
      return { responses: newResponses };
    }),

  updateTimeRemaining: (seconds) => set({ timeRemaining: seconds }),

  pauseTimer: () => set({ timerRunning: false }),

  resumeTimer: () => set({ timerRunning: true }),

  clearExam: () => set(initialState),

  getCurrentQuestion: () => {
    const { questions, currentQuestionIndex } = get();
    return questions[currentQuestionIndex] || null;
  },

  getProgress: () => {
    const { responses, questions } = get();
    const answered = responses.size;
    const total = questions.length;
    const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
    return { answered, total, percentage };
  },

  isQuestionAnswered: (questionId) => {
    return get().responses.has(questionId);
  },
}));

// Selector hooks
export const useCurrentAttempt = () => useExamStore((state) => state.currentAttempt);
export const useCurrentQuestion = () => useExamStore((state) => state.getCurrentQuestion());
export const useExamProgress = () => useExamStore((state) => state.getProgress());
export const useTimeRemaining = () => useExamStore((state) => state.timeRemaining);
