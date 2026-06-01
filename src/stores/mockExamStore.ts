import { create } from "zustand";
import { persist } from "zustand/middleware";
import LZString from "lz-string";
import type { ExamAttempt, Question, AttemptResponse, Subject } from "@/api/types";

// Module-level hook the persist storage adapter can flip when a write
// fails (typically QuotaExceededError on long WAEC sittings with image
// heavy questions). The runner reads `persistDegraded` and surfaces a
// banner so the user knows refreshing the tab will lose progress.
let markPersistDegraded: (() => void) | null = null;

// A single paper inside a subject. WAEC/NECO subjects have 2-3 of these;
// JAMB-style subjects have exactly 1.
export interface PaperSession {
  paperNumber: number;
  paperName: string;
  attemptId: string;
  attempt: ExamAttempt;
  questions: Question[];
  responses: Map<string, AttemptResponse>;
  answers: Record<string, any>;
  durationMinutes: number;
  numQuestions: number;
}

export interface SubjectSession {
  subject: Subject;
  papers: PaperSession[];
}

// Compact key for current-question tracking across (subject, paper) pairs.
export const cqKey = (subjectIdx: number, paperIdx: number) =>
  `${subjectIdx}:${paperIdx}`;

export interface MockExamState {
  sessionId: string | null;
  subjects: SubjectSession[];
  currentSubjectIndex: number;
  currentPaperIndex: number;
  currentQuestionIndexes: Record<string, number>; // key: cqKey(s, p)

  // Single shared timer = sum of every paper.durationMinutes * 60
  timeRemaining: number | null;
  timerRunning: boolean;

  // True when the persist storage couldn't write to localStorage (usually
  // QuotaExceededError). Not persisted itself; resets to false on a fresh
  // load. Runner displays a warning banner while this is true.
  persistDegraded: boolean;
  setPersistDegraded: (degraded: boolean) => void;

  // Actions
  startMockExam: (
    sessionId: string,
    subjects: Array<{
      subject: Subject;
      papers: Array<{
        paperNumber: number;
        paperName: string;
        attempt: ExamAttempt;
        questions: Question[];
        durationMinutes: number;
        numQuestions: number;
      }>;
    }>
  ) => void;

  setCurrentSubject: (index: number) => void;
  setCurrentPaper: (index: number) => void;
  setCurrentQuestion: (questionIndex: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;

  submitResponse: (
    subjectIndex: number,
    paperIndex: number,
    questionId: string,
    response: AttemptResponse
  ) => void;
  setAnswer: (
    subjectIndex: number,
    paperIndex: number,
    questionId: string,
    answer: any
  ) => void;

  updateTimeRemaining: (seconds: number | ((prev: number | null) => number | null)) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;

  clearMockExam: () => void;

  loadForReview: (
    sessionId: string,
    subjects: Array<{
      subject: Subject;
      papers: Array<{ paperNumber: number; paperName: string; attemptId: string }>;
    }>
  ) => void;

  // Getters
  getCurrentSubject: () => SubjectSession | null;
  getCurrentPaper: () => PaperSession | null;
  getCurrentQuestion: () => Question | null;
  getPaperProgress: (
    subjectIndex: number,
    paperIndex: number
  ) => { answered: number; total: number };
  getSubjectProgress: (subjectIndex: number) => { answered: number; total: number };
  getOverallProgress: () => { answered: number; total: number; percentage: number };
}

const initialState = {
  sessionId: null as string | null,
  subjects: [] as SubjectSession[],
  currentSubjectIndex: 0,
  currentPaperIndex: 0,
  currentQuestionIndexes: {} as Record<string, number>,
  timeRemaining: null as number | null,
  timerRunning: false,
  persistDegraded: false,
};

function isAnswered(answer: any): boolean {
  if (answer === null || answer === undefined) return false;
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === "string") return answer.length > 0;
  if (typeof answer === "boolean") return true;
  if (typeof answer === "object") return Object.keys(answer).length > 0;
  return false;
}

export const useMockExamStore = create<MockExamState>()(
  persist(
    (set, get) => {
      // Capture `set` so the storage adapter (defined below, outside this
      // closure) can flip persistDegraded when a localStorage write fails.
      // Guards against redundant updates so we don't churn renders.
      markPersistDegraded = () => {
        if (!get().persistDegraded) set({ persistDegraded: true });
      };

      return {
      ...initialState,

      setPersistDegraded: (degraded) => set({ persistDegraded: degraded }),

      startMockExam: (sessionId, sessionsInput) => {
        const subjects: SubjectSession[] = sessionsInput.map((s) => ({
          subject: s.subject,
          papers: s.papers.map((p) => ({
            paperNumber: p.paperNumber,
            paperName: p.paperName,
            attemptId: p.attempt.id!,
            attempt: p.attempt,
            questions: p.questions,
            responses: new Map(),
            answers: {},
            durationMinutes: p.durationMinutes,
            numQuestions: p.numQuestions,
          })),
        }));

        let totalDurationSeconds = 0;
        const questionIndexes: Record<string, number> = {};
        subjects.forEach((s, sIdx) => {
          s.papers.forEach((p, pIdx) => {
            totalDurationSeconds += (p.durationMinutes || 0) * 60;
            questionIndexes[cqKey(sIdx, pIdx)] = 0;
          });
        });

        set({
          sessionId,
          subjects,
          currentSubjectIndex: 0,
          currentPaperIndex: 0,
          currentQuestionIndexes: questionIndexes,
          timeRemaining: totalDurationSeconds > 0 ? totalDurationSeconds : null,
          timerRunning: true,
        });
      },

      setCurrentSubject: (index) => {
        const { subjects } = get();
        if (index >= 0 && index < subjects.length) {
          // Reset to first paper of the newly active subject — keeping a stale
          // paper index across subjects would put us on a paper that may not
          // exist for the new subject.
          set({ currentSubjectIndex: index, currentPaperIndex: 0 });
        }
      },

      setCurrentPaper: (index) => {
        const { subjects, currentSubjectIndex } = get();
        const subject = subjects[currentSubjectIndex];
        if (subject && index >= 0 && index < subject.papers.length) {
          set({ currentPaperIndex: index });
        }
      },

      setCurrentQuestion: (questionIndex) => {
        const { subjects, currentSubjectIndex, currentPaperIndex } = get();
        const paper = subjects[currentSubjectIndex]?.papers[currentPaperIndex];
        if (paper && questionIndex >= 0 && questionIndex < paper.questions.length) {
          set((state) => ({
            currentQuestionIndexes: {
              ...state.currentQuestionIndexes,
              [cqKey(currentSubjectIndex, currentPaperIndex)]: questionIndex,
            },
          }));
        }
      },

      nextQuestion: () => {
        const { subjects, currentSubjectIndex, currentPaperIndex, currentQuestionIndexes } =
          get();
        const paper = subjects[currentSubjectIndex]?.papers[currentPaperIndex];
        const key = cqKey(currentSubjectIndex, currentPaperIndex);
        const currentIdx = currentQuestionIndexes[key] ?? 0;
        if (paper && currentIdx < paper.questions.length - 1) {
          set({
            currentQuestionIndexes: { ...currentQuestionIndexes, [key]: currentIdx + 1 },
          });
        }
      },

      previousQuestion: () => {
        const { currentSubjectIndex, currentPaperIndex, currentQuestionIndexes } = get();
        const key = cqKey(currentSubjectIndex, currentPaperIndex);
        const currentIdx = currentQuestionIndexes[key] ?? 0;
        if (currentIdx > 0) {
          set({
            currentQuestionIndexes: { ...currentQuestionIndexes, [key]: currentIdx - 1 },
          });
        }
      },

      submitResponse: (subjectIndex, paperIndex, questionId, response) =>
        set((state) => {
          const newSubjects = state.subjects.map((s, sIdx) => {
            if (sIdx !== subjectIndex) return s;
            return {
              ...s,
              papers: s.papers.map((p, pIdx) => {
                if (pIdx !== paperIndex) return p;
                const newResponses = new Map(p.responses);
                newResponses.set(questionId, response);
                return { ...p, responses: newResponses };
              }),
            };
          });
          return { subjects: newSubjects };
        }),

      setAnswer: (subjectIndex, paperIndex, questionId, answer) =>
        set((state) => {
          const newSubjects = state.subjects.map((s, sIdx) => {
            if (sIdx !== subjectIndex) return s;
            return {
              ...s,
              papers: s.papers.map((p, pIdx) => {
                if (pIdx !== paperIndex) return p;
                return {
                  ...p,
                  answers: { ...p.answers, [questionId]: answer },
                };
              }),
            };
          });
          return { subjects: newSubjects };
        }),

      updateTimeRemaining: (seconds) =>
        set((state) => ({
          timeRemaining:
            typeof seconds === "function" ? seconds(state.timeRemaining) : seconds,
        })),

      pauseTimer: () => set({ timerRunning: false }),
      resumeTimer: () => set({ timerRunning: true }),

      clearMockExam: () =>
        set({
          ...initialState,
          subjects: [],
          currentQuestionIndexes: {},
        }),

      loadForReview: (sessionId, sessionsInput) => {
        const subjects: SubjectSession[] = sessionsInput.map((s) => ({
          subject: s.subject,
          papers: s.papers.map((p) => ({
            paperNumber: p.paperNumber,
            paperName: p.paperName,
            attemptId: p.attemptId,
            attempt: { id: p.attemptId } as ExamAttempt,
            questions: [],
            responses: new Map(),
            answers: {},
            durationMinutes: 0,
            numQuestions: 0,
          })),
        }));
        set({
          sessionId,
          subjects,
          currentSubjectIndex: 0,
          currentPaperIndex: 0,
          currentQuestionIndexes: {},
          timeRemaining: null,
          timerRunning: false,
        });
      },

      getCurrentSubject: () => {
        const { subjects, currentSubjectIndex } = get();
        return subjects[currentSubjectIndex] || null;
      },

      getCurrentPaper: () => {
        const { subjects, currentSubjectIndex, currentPaperIndex } = get();
        return subjects[currentSubjectIndex]?.papers[currentPaperIndex] || null;
      },

      getCurrentQuestion: () => {
        const { subjects, currentSubjectIndex, currentPaperIndex, currentQuestionIndexes } =
          get();
        const paper = subjects[currentSubjectIndex]?.papers[currentPaperIndex];
        if (!paper) return null;
        const qIndex = currentQuestionIndexes[cqKey(currentSubjectIndex, currentPaperIndex)] ?? 0;
        return paper.questions[qIndex] || null;
      },

      getPaperProgress: (subjectIndex, paperIndex) => {
        const { subjects } = get();
        const paper = subjects[subjectIndex]?.papers[paperIndex];
        if (!paper) return { answered: 0, total: 0 };
        let answered = 0;
        paper.questions.forEach((q) => {
          if (isAnswered(paper.answers[q.id])) answered++;
        });
        return { answered, total: paper.questions.length };
      },

      getSubjectProgress: (subjectIndex) => {
        const { subjects } = get();
        const subject = subjects[subjectIndex];
        if (!subject) return { answered: 0, total: 0 };
        let answered = 0;
        let total = 0;
        subject.papers.forEach((p) => {
          total += p.questions.length;
          p.questions.forEach((q) => {
            if (isAnswered(p.answers[q.id])) answered++;
          });
        });
        return { answered, total };
      },

      getOverallProgress: () => {
        const { subjects } = get();
        let answered = 0;
        let total = 0;
        subjects.forEach((s) => {
          s.papers.forEach((p) => {
            total += p.questions.length;
            p.questions.forEach((q) => {
              if (isAnswered(p.answers[q.id])) answered++;
            });
          });
        });
        const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;
        return { answered, total, percentage };
      },
      };
    },
    {
      name: "mock-exam-store",
      version: 2,
      // v1 used a flat subjects[] with a single attempt per subject. Wrap it
      // into the new nested shape so a JAMB session in flight survives the
      // deploy.
      migrate: (persistedState: any, version) => {
        if (!persistedState) return persistedState;
        if (version >= 2) return persistedState;

        const oldSubjects: any[] = Array.isArray(persistedState.subjects)
          ? persistedState.subjects
          : [];

        const newSubjects = oldSubjects.map((s, sIdx) => {
          const responses =
            s.responses instanceof Map
              ? s.responses
              : new Map(s.responses ? Object.entries(s.responses) : []);
          return {
            subject: s.subject,
            papers: [
              {
                paperNumber: 1,
                paperName: "Paper 1",
                attemptId: s.attemptId,
                attempt: s.attempt,
                questions: s.questions || [],
                responses,
                answers: s.answers || {},
                durationMinutes: s.durationMinutes || 0,
                numQuestions: (s.questions || []).length,
              },
            ],
            _legacySubjectIdx: sIdx,
          };
        });

        // Rebuild currentQuestionIndexes from the old shape: oldKey was the
        // subject index. In the new shape every subject has paperIdx 0, so
        // map subject -> "{subject}:0".
        const oldCqIdx: Record<number, number> =
          persistedState.currentQuestionIndexes || {};
        const newCqIdx: Record<string, number> = {};
        Object.entries(oldCqIdx).forEach(([sKey, qIdx]) => {
          const sNum = Number(sKey);
          if (!Number.isNaN(sNum)) {
            newCqIdx[cqKey(sNum, 0)] = qIdx as number;
          }
        });

        return {
          ...persistedState,
          subjects: newSubjects.map(({ _legacySubjectIdx: _i, ...rest }) => rest),
          currentPaperIndex: 0,
          currentQuestionIndexes: newCqIdx,
        };
      },
      partialize: (state) => ({
        sessionId: state.sessionId,
        subjects: state.subjects,
        currentSubjectIndex: state.currentSubjectIndex,
        currentPaperIndex: state.currentPaperIndex,
        currentQuestionIndexes: state.currentQuestionIndexes,
        timeRemaining: state.timeRemaining,
        timerRunning: state.timerRunning,
      }),
      storage: {
        getItem: (name) => {
          try {
            const raw = localStorage.getItem(name);
            if (!raw) return null;

            // New format is LZ-compressed UTF16. Old format (pre-deploy)
            // is plain JSON. decompressFromUTF16 returns null/empty for
            // non-compressed input — fall back to treating raw as JSON
            // so in-flight sessions survive the deploy.
            let str: string | null = null;
            try {
              str = LZString.decompressFromUTF16(raw);
            } catch {
              str = null;
            }
            if (!str) str = raw;

            const parsed = JSON.parse(str);
            const state = parsed.state;
            // Convert each paper's responses object back into a Map.
            const subjects = (state.subjects || []).map((s: any) => ({
              ...s,
              papers: (s.papers || []).map((p: any) => ({
                ...p,
                responses: new Map(p.responses ? Object.entries(p.responses) : []),
              })),
            }));
            return {
              ...parsed,
              state: { ...state, subjects },
            };
          } catch {
            localStorage.removeItem(name);
            return null;
          }
        },
        setItem: (name, newValue) => {
          try {
            // Convert each paper's responses Map into a plain object for JSON.
            const state = newValue.state as any;
            const subjects = (state.subjects || []).map((s: any) => ({
              ...s,
              papers: (s.papers || []).map((p: any) => ({
                ...p,
                responses: p.responses ? Object.fromEntries(p.responses) : {},
              })),
            }));
            const json = JSON.stringify({
              ...newValue,
              state: { ...state, subjects },
            });
            // Compress before writing. compressToUTF16 is purpose-built
            // for localStorage and typically gives 2-4× headroom on the
            // text-heavy question payloads we persist.
            const compressed = LZString.compressToUTF16(json);
            localStorage.setItem(name, compressed);
          } catch {
            // QuotaExceededError or serialization failure — surface to UI.
            markPersistDegraded?.();
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
