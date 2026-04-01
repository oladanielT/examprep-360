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

// Starts multiple mock exams in parallel, one per subject
export interface StartMockExamInput {
  subjects: Array<{
    subject: Subject;
    examId: string; // the mock exam ID to start for this subject
  }>;
}

export const useStartMockExams = () => {
  const { startMockExam } = useMockExamStore();

  return useMutation<
    { sessionId: string },
    AxiosError<ApiError>,
    StartMockExamInput
  >({
    mutationFn: async ({ subjects }) => {
      // Start all exams in parallel
      const results = await Promise.all(
        subjects.map(async ({ subject, examId }) => {
          const { data } = await apiClient.post<StartExamResponse>(
            EXAM_ENDPOINTS.START(examId)
          );
          return { subject, data };
        })
      );

      // Generate a session ID
      const sessionId = crypto.randomUUID();

      // Build sessions from results
      const sessions = results.map(({ subject, data }) => ({
        subject,
        attempt: data as unknown as ExamAttempt,
        questions: data.exam.questions.map((eq) => eq.question),
        durationMinutes: data.exam.durationMinutes,
      }));

      // Store in mock exam store
      startMockExam(sessionId, sessions);

      return { sessionId };
    },
  });
};

// Submit a single response for a question in a mock exam subject
export const useMockSubmitResponse = () => {
  const { submitResponse } = useMockExamStore();

  return useMutation<
    AttemptResponse,
    AxiosError<ApiError>,
    { subjectIndex: number; attemptId: string; request: SubmitResponseRequest }
  >({
    mutationFn: async ({ attemptId, request }) => {
      const { data } = await apiClient.post<AttemptResponse>(
        EXAM_ENDPOINTS.SUBMIT_RESPONSE(attemptId),
        request
      );
      return data;
    },
    onSuccess: (data, variables) => {
      submitResponse(variables.subjectIndex, data.questionId, data);
    },
  });
};

// Complete all subject exams in a combined mock exam
export const useCompleteMockExam = () => {
  const queryClient = useQueryClient();
  const { clearMockExam, subjects } = useMockExamStore();

  return useMutation<
    void,
    AxiosError<ApiError>,
    void
  >({
    mutationFn: async () => {
      // For each subject, collect unsubmitted answers and bulk-submit with complete: true
      await Promise.all(
        subjects.map(async (session) => {
          const unsubmittedResponses = session.questions
            .filter((q) => {
              const answer = session.answers[q.id];
              const isSubmitted = session.responses.has(q.id);
              if (isSubmitted) return false;
              if (answer === null || answer === undefined) return false;
              if (Array.isArray(answer)) return answer.length > 0;
              if (typeof answer === "string") return answer.length > 0;
              if (typeof answer === "boolean") return true;
              if (typeof answer === "object") return Object.keys(answer).length > 0;
              return false;
            })
            .map((q) => {
              const answer = session.answers[q.id];
              let formattedAnswer: string | string[] | boolean = "";
              if (typeof answer === "boolean") {
                formattedAnswer = answer;
              } else if (Array.isArray(answer)) {
                formattedAnswer = answer;
              } else if (typeof answer === "object") {
                formattedAnswer = JSON.stringify(answer);
              } else {
                formattedAnswer = answer;
              }
              return {
                questionId: q.id,
                answer: formattedAnswer,
                timeSpentSeconds: 0,
              };
            });

          if (unsubmittedResponses.length > 0) {
            await apiClient.post<SubmitResponsesBulkResponse>(
              EXAM_ENDPOINTS.SUBMIT_RESPONSES_BULK(session.attemptId),
              {
                responses: unsubmittedResponses,
                complete: true,
              } as SubmitResponsesBulkRequest
            );
          } else {
            // Just complete the exam
            await apiClient.post(EXAM_ENDPOINTS.COMPLETE(session.attemptId));
          }
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["examHistory"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });
};

// Pause all subject exams
export const usePauseMockExam = () => {
  const { pauseTimer, subjects } = useMockExamStore();

  return useMutation<void, AxiosError<ApiError>, void>({
    mutationFn: async () => {
      await Promise.all(
        subjects.map((session) =>
          apiClient.patch<ExamAttempt>(EXAM_ENDPOINTS.PAUSE(session.attemptId))
        )
      );
    },
    onSuccess: () => {
      pauseTimer();
    },
  });
};

// Resume all subject exams
export const useResumeMockExam = () => {
  const { resumeTimer, subjects } = useMockExamStore();

  return useMutation<void, AxiosError<ApiError>, void>({
    mutationFn: async () => {
      await Promise.all(
        subjects.map((session) =>
          apiClient.patch<ExamAttempt>(EXAM_ENDPOINTS.RESUME(session.attemptId))
        )
      );
    },
    onSuccess: () => {
      resumeTimer();
    },
  });
};
