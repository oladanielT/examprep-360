import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExamAttempt, Question, AttemptResponse, Subject } from "@/api/types";

// A single subject's exam session within the combined mock
export interface SubjectSession {
  subject: Subject;
  attemptId: string;
  attempt: ExamAttempt;
  questions: Question[];
  responses: Map<string, AttemptResponse>;
  answers: Record<string, any>;
  durationMinutes: number;
}

export interface MockExamState {
  // Session identity
  sessionId: string | null;

  // All subject sessions in this combined exam
  subjects: SubjectSession[];

  // Currently active subject index
  currentSubjectIndex: number;

  // Per-subject question navigation (subject index -> question index)
  currentQuestionIndexes: Record<number, number>;

  // Combined timer (sum of all subject durations)
  timeRemaining: number | null;
  timerRunning: boolean;

  // Actions
  startMockExam: (
    sessionId: string,
    sessions: Array<{
      subject: Subject;
      attempt: ExamAttempt;
      questions: Question[];
      durationMinutes: number;
    }>
  ) => void;

  setCurrentSubject: (index: number) => void;
  setCurrentQuestion: (questionIndex: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;

  submitResponse: (subjectIndex: number, questionId: string, response: AttemptResponse) => void;
  setAnswer: (subjectIndex: number, questionId: string, answer: any) => void;

  updateTimeRemaining: (seconds: number | ((prev: number | null) => number | null)) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;

  clearMockExam: () => void;

  // Getters
  getCurrentSubject: () => SubjectSession | null;
  getCurrentQuestion: () => Question | null;
  getSubjectProgress: (subjectIndex: number) => { answered: number; total: number };
  getOverallProgress: () => { answered: number; total: number; percentage: number };
}

const initialState = {
  sessionId: null as string | null,
  subjects: [] as SubjectSession[],
  currentSubjectIndex: 0,
  currentQuestionIndexes: {} as Record<number, number>,
  timeRemaining: null as number | null,
  timerRunning: false,
};

export const useMockExamStore = create<MockExamState>()(
  persist(
    (set, get) => ({
      ...initialState,

      startMockExam: (sessionId, sessions) => {
        const totalDurationSeconds = sessions.reduce(
          (sum, s) => sum + (s.durationMinutes || 0) * 60,
          0
        );

        const subjects: SubjectSession[] = sessions.map((s) => ({
          subject: s.subject,
          attemptId: s.attempt.id!,
          attempt: s.attempt,
          questions: s.questions,
          responses: new Map(),
          answers: {},
          durationMinutes: s.durationMinutes,
        }));

        const questionIndexes: Record<number, number> = {};
        sessions.forEach((_, i) => {
          questionIndexes[i] = 0;
        });

        set({
          sessionId,
          subjects,
          currentSubjectIndex: 0,
          currentQuestionIndexes: questionIndexes,
          timeRemaining: totalDurationSeconds > 0 ? totalDurationSeconds : null,
          timerRunning: true,
        });
      },

      setCurrentSubject: (index) => {
        const { subjects } = get();
        if (index >= 0 && index < subjects.length) {
          set({ currentSubjectIndex: index });
        }
      },

      setCurrentQuestion: (questionIndex) => {
        const { currentSubjectIndex, subjects } = get();
        const session = subjects[currentSubjectIndex];
        if (session && questionIndex >= 0 && questionIndex < session.questions.length) {
          set((state) => ({
            currentQuestionIndexes: {
              ...state.currentQuestionIndexes,
              [currentSubjectIndex]: questionIndex,
            },
          }));
        }
      },

      nextQuestion: () => {
        const { currentSubjectIndex, currentQuestionIndexes, subjects } = get();
        const session = subjects[currentSubjectIndex];
        const currentIdx = currentQuestionIndexes[currentSubjectIndex] || 0;
        if (session && currentIdx < session.questions.length - 1) {
          set({
            currentQuestionIndexes: {
              ...currentQuestionIndexes,
              [currentSubjectIndex]: currentIdx + 1,
            },
          });
        }
      },

      previousQuestion: () => {
        const { currentSubjectIndex, currentQuestionIndexes } = get();
        const currentIdx = currentQuestionIndexes[currentSubjectIndex] || 0;
        if (currentIdx > 0) {
          set({
            currentQuestionIndexes: {
              ...currentQuestionIndexes,
              [currentSubjectIndex]: currentIdx - 1,
            },
          });
        }
      },

      submitResponse: (subjectIndex, questionId, response) =>
        set((state) => {
          const newSubjects = [...state.subjects];
          const session = newSubjects[subjectIndex];
          if (session) {
            const newResponses = new Map(session.responses);
            newResponses.set(questionId, response);
            newSubjects[subjectIndex] = { ...session, responses: newResponses };
          }
          return { subjects: newSubjects };
        }),

      setAnswer: (subjectIndex, questionId, answer) =>
        set((state) => {
          const newSubjects = [...state.subjects];
          const session = newSubjects[subjectIndex];
          if (session) {
            newSubjects[subjectIndex] = {
              ...session,
              answers: { ...session.answers, [questionId]: answer },
            };
          }
          return { subjects: newSubjects };
        }),

      updateTimeRemaining: (seconds) =>
        set((state) => ({
          timeRemaining: typeof seconds === "function" ? seconds(state.timeRemaining) : seconds,
        })),

      pauseTimer: () => set({ timerRunning: false }),
      resumeTimer: () => set({ timerRunning: true }),

      clearMockExam: () =>
        set({
          ...initialState,
          subjects: [],
          currentQuestionIndexes: {},
        }),

      getCurrentSubject: () => {
        const { subjects, currentSubjectIndex } = get();
        return subjects[currentSubjectIndex] || null;
      },

      getCurrentQuestion: () => {
        const { subjects, currentSubjectIndex, currentQuestionIndexes } = get();
        const session = subjects[currentSubjectIndex];
        if (!session) return null;
        const qIndex = currentQuestionIndexes[currentSubjectIndex] || 0;
        return session.questions[qIndex] || null;
      },

      getSubjectProgress: (subjectIndex) => {
        const { subjects } = get();
        const session = subjects[subjectIndex];
        if (!session) return { answered: 0, total: 0 };
        return {
          answered: session.responses.size,
          total: session.questions.length,
        };
      },

      getOverallProgress: () => {
        const { subjects } = get();
        let answered = 0;
        let total = 0;
        subjects.forEach((s) => {
          answered += s.responses.size;
          total += s.questions.length;
        });
        const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
        return { answered, total, percentage };
      },
    }),
    {
      name: "mock-exam-store",
      partialize: (state) => ({
        sessionId: state.sessionId,
        subjects: state.subjects,
        currentSubjectIndex: state.currentSubjectIndex,
        currentQuestionIndexes: state.currentQuestionIndexes,
        timeRemaining: state.timeRemaining,
        timerRunning: state.timerRunning,
      }),
      storage: {
        getItem: (name) => {
          try {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const { state } = JSON.parse(str);
            return {
              state: {
                ...state,
                subjects: (state.subjects || []).map((s: any) => ({
                  ...s,
                  responses: new Map(s.responses ? Object.entries(s.responses) : []),
                })),
              },
            };
          } catch {
            localStorage.removeItem(name);
            return null;
          }
        },
        setItem: (name, newValue) => {
          try {
            const str = JSON.stringify({
              state: {
                ...newValue.state,
                subjects: (newValue.state.subjects || []).map((s: any) => ({
                  ...s,
                  responses: s.responses
                    ? Object.fromEntries(s.responses)
                    : {},
                })),
              },
            });
            localStorage.setItem(name, str);
          } catch {
            // QuotaExceededError or serialization failure
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
