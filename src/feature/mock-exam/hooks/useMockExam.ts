import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { EXAM_ENDPOINTS } from "@/api/endpoints";
import { useMockExamStore } from "@/stores/mockExamStore";
import type {
  StartExamResponse,
  AttemptResponse,
  SubmitResponseRequest,
  SubmitResponsesBulkRequest,
  SubmitResponsesBulkResponse,
  ExamAttempt,
  Subject,
} from "@/api/types";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

// True when an error's backend message matches a pattern. Used to treat
// "already completed" / "already paused" style conflicts as success so a
// retry after a partial failure converges instead of erroring forever on
// the papers that DID go through.
function errorMessageMatches(err: unknown, pattern: RegExp): boolean {
  const msg = (err as AxiosError<ApiError>)?.response?.data?.message;
  const text = Array.isArray(msg) ? msg.join(" ") : msg;
  return typeof text === "string" && pattern.test(text);
}

function rejectedOf(results: PromiseSettledResult<unknown>[]): PromiseRejectedResult[] {
  return results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
}

// Input for starting a multi-paper simulation. Each subject contributes one
// or more papers; each paper starts its own attempt on the server.
export interface StartMockExamInput {
  subjects: Array<{
    subject: Subject;
    papers: Array<{
      paperNumber: number;
      paperName: string;
      examId: string;
    }>;
  }>;
}

// Fires POST /exams/{examId}/start for every paper across every subject in
// parallel, then writes the nested session into the mock exam store.
export const useStartMockExams = () => {
  const { startMockExam } = useMockExamStore();

  return useMutation<
    { sessionId: string },
    AxiosError<ApiError>,
    StartMockExamInput
  >({
    mutationFn: async ({ subjects }) => {
      // Build a flat list of (subjectIdx, paper) pairs to start in parallel.
      // Keeping the subject index around lets us reassemble the nested shape
      // after all the starts resolve, regardless of resolution order.
      type StartTask = {
        subjectIdx: number;
        paperNumber: number;
        paperName: string;
        examId: string;
      };
      const tasks: StartTask[] = subjects.flatMap((s, sIdx) =>
        s.papers.map((p) => ({
          subjectIdx: sIdx,
          paperNumber: p.paperNumber,
          paperName: p.paperName,
          examId: p.examId,
        }))
      );

      const settled = await Promise.allSettled(
        tasks.map(async (task) => {
          const { data } = await apiClient.post<StartExamResponse>(
            EXAM_ENDPOINTS.START(task.examId)
          );
          return { task, data };
        })
      );

      const failures = rejectedOf(settled);
      if (failures.length > 0) {
        // Partial failure: some attempts are now in-progress on the server.
        // There's no abandon endpoint, so pause them (best effort) — they
        // land in "Paused exams" where the user can see/resume them instead
        // of silently blocking future starts as orphaned attempts.
        const started = settled.filter(
          (r): r is PromiseFulfilledResult<{ task: (typeof tasks)[number]; data: StartExamResponse }> =>
            r.status === "fulfilled"
        );
        await Promise.allSettled(
          started.map((r) =>
            apiClient.patch(EXAM_ENDPOINTS.PAUSE(r.value.data.id))
          )
        );
        // Surface the backend's reason (e.g. "active exam already exists").
        throw failures[0].reason;
      }

      const results = settled.map(
        (r) =>
          (r as PromiseFulfilledResult<{ task: (typeof tasks)[number]; data: StartExamResponse }>).value
      );

      // Reassemble: bucket per-subject paper sessions, sorted by paperNumber.
      const perSubject: Array<{
        subject: Subject;
        papers: Array<{
          paperNumber: number;
          paperName: string;
          attempt: ExamAttempt;
          questions: StartExamResponse["exam"]["questions"][number]["question"][];
          durationMinutes: number;
          numQuestions: number;
        }>;
      }> = subjects.map((s) => ({ subject: s.subject, papers: [] }));

      for (const { task, data } of results) {
        const questions = data.exam.questions.map((eq) => eq.question);
        perSubject[task.subjectIdx].papers.push({
          paperNumber: task.paperNumber,
          paperName: task.paperName,
          attempt: data as unknown as ExamAttempt,
          questions,
          durationMinutes: data.exam.durationMinutes,
          numQuestions: questions.length,
        });
      }

      // Stable paper order regardless of API response ordering.
      perSubject.forEach((s) =>
        s.papers.sort((a, b) => a.paperNumber - b.paperNumber)
      );

      const sessionId = crypto.randomUUID();
      startMockExam(sessionId, perSubject);

      return { sessionId };
    },
  });
};

// Submit a single response. Caller passes the paper coordinates so the
// response lands in the correct paper's bucket in the store.
export const useMockSubmitResponse = () => {
  const { submitResponse } = useMockExamStore();

  return useMutation<
    AttemptResponse,
    AxiosError<ApiError>,
    {
      subjectIndex: number;
      paperIndex: number;
      attemptId: string;
      request: SubmitResponseRequest;
    }
  >({
    mutationFn: async ({ attemptId, request }) => {
      const { data } = await apiClient.post<AttemptResponse>(
        EXAM_ENDPOINTS.SUBMIT_RESPONSE(attemptId),
        request
      );
      return data;
    },
    onSuccess: (data, variables) => {
      submitResponse(
        variables.subjectIndex,
        variables.paperIndex,
        data.questionId,
        data
      );
    },
  });
};

// Helper: encode an answer the same way the single-subject exam runner does.
function formatAnswer(answer: any): string | string[] | boolean {
  if (typeof answer === "boolean") return answer;
  if (Array.isArray(answer)) return answer;
  if (typeof answer === "object") return JSON.stringify(answer);
  return answer;
}

function isAnswered(answer: any): boolean {
  if (answer === null || answer === undefined) return false;
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === "string") return answer.length > 0;
  if (typeof answer === "boolean") return true;
  if (typeof answer === "object") return Object.keys(answer).length > 0;
  return false;
}

// Complete every paper attempt across every subject in parallel. For each
// paper: bulk-submit anything not yet submitted with complete:true, or hit
// the plain complete endpoint when there's nothing left to submit.
export const useCompleteMockExam = () => {
  const queryClient = useQueryClient();
  const { subjects } = useMockExamStore();

  return useMutation<void, AxiosError<ApiError>, void>({
    mutationFn: async () => {
      const papers = subjects.flatMap((s) => s.papers);

      const settled = await Promise.allSettled(
        papers.map(async (paper) => {
          try {
            const unsubmittedResponses = paper.questions
              .filter((q) => {
                const answer = paper.answers[q.id];
                const alreadySubmitted = paper.responses.has(q.id);
                if (alreadySubmitted) return false;
                return isAnswered(answer);
              })
              .map((q) => ({
                questionId: q.id,
                answer: formatAnswer(paper.answers[q.id]),
                timeSpentSeconds: 0,
              }));

            if (unsubmittedResponses.length > 0) {
              await apiClient.post<SubmitResponsesBulkResponse>(
                EXAM_ENDPOINTS.SUBMIT_RESPONSES_BULK(paper.attemptId),
                {
                  responses: unsubmittedResponses,
                  complete: true,
                } as SubmitResponsesBulkRequest
              );
            } else {
              await apiClient.post(EXAM_ENDPOINTS.COMPLETE(paper.attemptId));
            }
          } catch (err) {
            // A previous partial completion may have already closed this
            // paper — converge instead of failing the retry forever.
            if (errorMessageMatches(err, /already.*(complet|submit)/i)) return;
            throw err;
          }
        })
      );

      const failures = rejectedOf(settled);
      if (failures.length > 0) {
        const backendMsg = (failures[0].reason as AxiosError<ApiError>)
          ?.response?.data?.message;
        const detail =
          typeof backendMsg === "string" ? ` (${backendMsg})` : "";
        throw new Error(
          `${failures.length} of ${papers.length} paper(s) failed to submit${detail}. ` +
            `Tap Complete again — papers that already went through won't be re-submitted.`
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["examHistory"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });
};

// Pause every paper attempt in parallel. "Already paused" conflicts are
// treated as success so a retry after partial failure converges.
export const usePauseMockExam = () => {
  const { pauseTimer, subjects } = useMockExamStore();

  return useMutation<void, AxiosError<ApiError>, void>({
    mutationFn: async () => {
      const papers = subjects.flatMap((s) => s.papers);
      const settled = await Promise.allSettled(
        papers.map(async (p) => {
          try {
            await apiClient.patch<ExamAttempt>(EXAM_ENDPOINTS.PAUSE(p.attemptId));
          } catch (err) {
            if (errorMessageMatches(err, /already.*paus|not.*in.*progress/i))
              return;
            throw err;
          }
        })
      );
      const failures = rejectedOf(settled);
      if (failures.length > 0) throw failures[0].reason;
    },
    onSuccess: () => {
      pauseTimer();
    },
  });
};

// Resume every paper attempt in parallel. "Already in progress" conflicts
// are treated as success so a retry after partial failure converges.
export const useResumeMockExam = () => {
  const { resumeTimer, subjects } = useMockExamStore();

  return useMutation<void, AxiosError<ApiError>, void>({
    mutationFn: async () => {
      const papers = subjects.flatMap((s) => s.papers);
      const settled = await Promise.allSettled(
        papers.map(async (p) => {
          try {
            await apiClient.patch<ExamAttempt>(EXAM_ENDPOINTS.RESUME(p.attemptId));
          } catch (err) {
            if (errorMessageMatches(err, /already.*(progress|resum|activ)/i))
              return;
            throw err;
          }
        })
      );
      const failures = rejectedOf(settled);
      if (failures.length > 0) throw failures[0].reason;
    },
    onSuccess: () => {
      resumeTimer();
    },
  });
};
