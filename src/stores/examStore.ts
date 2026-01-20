import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExamAttempt, Question, AttemptResponse, ExamPreferencesResponse } from "@/api/types";

interface ExamState {
  // User preferences (cached from API)
  preferences: ExamPreferencesResponse | null;

  // Current attempt
  currentAttempt: ExamAttempt | null;
  questions: Question[];
  responses: Map<string, AttemptResponse>;
  answers: Record<string, any>; // Local draft answers (before submission)

  // Navigation
  currentQuestionIndex: number;

  // Timer
  timeRemaining: number | null; // in seconds, null if no time limit
  timerRunning: boolean;

  // Actions
  setPreferences: (preferences: ExamPreferencesResponse) => void;
  clearPreferences: () => void;
  startExam: (attempt: ExamAttempt, questions: Question[], timeLimit?: number) => void;
  setCurrentQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitResponse: (questionId: string, response: AttemptResponse) => void;
  setAnswer: (questionId: string, answer: any) => void; // New action
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
  preferences: null as ExamPreferencesResponse | null,
  currentAttempt: null,
  questions: [],
  responses: new Map<string, AttemptResponse>(),
  answers: {},
  currentQuestionIndex: 0,
  timeRemaining: null,
  timerRunning: false,
};

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPreferences: (preferences) => set({ preferences }),

      clearPreferences: () => set({ preferences: null }),

      startExam: (attempt, questions, timeLimit) =>
        set({
          currentAttempt: attempt,
          questions,
          responses: new Map(),
          answers: {},
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

      setAnswer: (questionId, answer) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer },
        })),

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
    }),
    {
      name: "exam-store",
      partialize: (state) => ({
        // Persist preferences
        preferences: state.preferences,
        // Persist exam state for recovery on refresh
        currentAttempt: state.currentAttempt,
        questions: state.questions,
        responses: state.responses,
        answers: state.answers, // Persist draft answers
        currentQuestionIndex: state.currentQuestionIndex,
        timeRemaining: state.timeRemaining,
        timerRunning: state.timerRunning,
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              // Convert responses array back to Map (JSON serialization loses Map type)
              responses: new Map(state.responses ? Object.entries(state.responses) : []),
            },
          };
        },
        setItem: (name, newValue) => {
          const str = JSON.stringify({
            state: {
              ...newValue.state,
              // Convert Map to object for JSON serialization
              responses: newValue.state.responses
                ? Object.fromEntries(newValue.state.responses)
                : {},
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

// Selector hooks
export const useCurrentAttempt = () => useExamStore((state) => state.currentAttempt);
export const useCurrentQuestion = () => useExamStore((state) => state.getCurrentQuestion());
export const useExamProgress = () => useExamStore((state) => state.getProgress());
export const useTimeRemaining = () => useExamStore((state) => state.timeRemaining);
export const useExamPreferencesStore = () => useExamStore((state) => state.preferences);
