import { isProfessionalExam } from "@/lib/exam-category";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { EXAM_ENDPOINTS, EXAM_SELECTION_ENDPOINTS, TRIAL_ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/stores/authStore";
import { useExamStore } from "@/stores/examStore";
import type {
  ExamAttempt,
  Bookmark,
  QuestionReport,
  StartPracticeRequest,
  ConfigurePracticeRequest,
  SubmitResponseRequest,
  SubmitResponsesBulkRequest,
  SubmitResponsesBulkResponse,
  ReportQuestionRequest,
  ToggleBookmarkRequest,
  StartExamResponse,
  AttemptResponse,
  AvailableExamsParams,
  AvailableExamsResponse,
  ExamPreferencesResponse,
  ExamHistoryResponse,
  ExamHistoryParams,
  PausedExam,
  ExamQuestionsResponse,
  ExamCategoryOption,
  ExamSubtypeOption,
  SubjectOption,
  ExamReviewResponse,
} from "@/api/types";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

// ==================== QUERIES ====================

// Fetch exam preferences (for /tests page - list of exam types like JAMB, WAEC, etc.)
export const useExamPreferences = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setPreferences = useExamStore((state) => state.setPreferences);

  return useQuery<ExamPreferencesResponse>({
    queryKey: ["examPreferences"],
    queryFn: async () => {
      const { data } = await apiClient.get<ExamPreferencesResponse>(
        EXAM_ENDPOINTS.PREFERENCES
      );
      if (import.meta.env.DEV) {
        console.info("[exam-debug] preferences", {
          examCategory: data.examCategory,
          examSubtype: data.examSubtype,
          examTypeId: data.examTypeId,
          examTypeRecord: data.examTypeRecord,
          selectedSubjects: data.selectedSubjects,
          selectedCourses: data.selectedCourses,
          subjects: data.subjects?.map((subject) => ({
            id: subject.id,
            name: subject.name,
          })),
          subjectCount: data.subjects?.length ?? 0,
          courseCount: data.courses?.length ?? 0,
        });
      }
      // Store in Zustand for persistence
      setPreferences(data);
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes - refetch periodically
  });
};

// Fetch available exams (for /tests/exams page - list of exams filtered by subject, year, etc.)
export const useAvailableExams = (
  params: AvailableExamsParams,
  enabled = true,
) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<AvailableExamsResponse>({
    queryKey: ["availableExams", params],
    queryFn: async () => {
      const { data } = await apiClient.get<AvailableExamsResponse>(
        EXAM_ENDPOINTS.AVAILABLE,
        { params }
      );
      if (import.meta.env.DEV) {
        const exams = Array.isArray(data)
          ? data
          : Object.values(data).flat();
        console.info("[exam-debug] available exams", {
          params,
          examCount: exams.length,
          exams: exams.map((exam) => ({
            id: exam.id,
            name: exam.name,
            examTypeEnum: exam.examTypeEnum,
            subjectId: exam.subjectId,
            subjectName: exam.subject?.name,
            numQuestions: exam.numQuestions,
            durationMinutes: exam.durationMinutes,
            status: exam.status,
          })),
        });
      }
      return data;
    },
    enabled: isAuthenticated && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Fetch exam questions for offline/prefetch (GET /student/exams/:id/questions)
export const useExamQuestions = (examId: string, enabled = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<ExamQuestionsResponse>({
    queryKey: ["examQuestions", examId],
    queryFn: async () => {
      const { data } = await apiClient.get<ExamQuestionsResponse>(
        EXAM_ENDPOINTS.QUESTIONS(examId)
      );
      if (import.meta.env.DEV) {
        console.info("[exam-debug] exam questions", {
          examId,
          questionCount: data.questions?.length ?? 0,
          questionIds: data.questions?.map((question) => question.id),
        });
      }
      return data;
    },
    enabled: isAuthenticated && !!examId && enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes - questions don't change often
  });
};

// Fetch exam history
export const useExamHistory = (params: ExamHistoryParams = {}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<ExamHistoryResponse>({
    queryKey: ["examHistory", params],
    queryFn: async () => {
      const { data } = await apiClient.get<ExamHistoryResponse>(
        EXAM_ENDPOINTS.HISTORY,
        {
          params,
        }
      );
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes - exam history doesn't change frequently
  });
};

// Fetch paused exams
export const usePausedExams = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<PausedExam[]>({
    queryKey: ["pausedExams"],
    queryFn: async () => {
      const { data } = await apiClient.get<PausedExam[]>(EXAM_ENDPOINTS.PAUSED);
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 1, // 1 minute - paused exams list changes when user pauses/resumes
  });
};

// Fetch bookmarked questions
export const useBookmarks = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<Bookmark[]>({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const { data } = await apiClient.get<Bookmark[]>(
        EXAM_ENDPOINTS.BOOKMARKS
      );
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 3, // 3 minutes - bookmarks don't change too frequently
  });
};

// Fetch reported questions
export const useReports = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<QuestionReport[]>({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data } = await apiClient.get<QuestionReport[]>(
        EXAM_ENDPOINTS.REPORTS
      );
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes - reports list is relatively static
  });
};

// Exam Selection Queries
export const useExamCategories = () => {
  return useQuery<ExamCategoryOption[]>({
    queryKey: ["examSelection", "categories"],
    queryFn: async () => {
      const { data } = await apiClient.get<ExamCategoryOption[]>(
        EXAM_SELECTION_ENDPOINTS.CATEGORIES
      );
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useExamTypes = (category: string) => {
  return useQuery<ExamSubtypeOption[]>({
    queryKey: ["examSelection", "examTypes", category],
    queryFn: async () => {
      const isProfessional = isProfessionalExam(category);
      if (isProfessional) {
        const { data } = await apiClient.get<
          Array<{
            id: string;
            value: string;
            slug?: string;
            label: string;
          }>
        >(EXAM_SELECTION_ENDPOINTS.SUBTYPES(category));

        if (import.meta.env.DEV) {
          console.info("[exam-debug] professional subtypes", {
            category,
            options: data,
          });
        }

        return data.map((subtype) => ({
          id: subtype.id,
          name: subtype.value || subtype.label,
          label: subtype.label,
          category,
        }));
      }

      const { data } = await apiClient.get<ExamSubtypeOption[]>(
        EXAM_SELECTION_ENDPOINTS.EXAM_TYPES(category)
      );
      return data;
    },
    enabled: !!category,
    staleTime: 1000 * 60 * 60,
  });
};

export const useExamSubjects = (examType: string) => {
  return useQuery<SubjectOption[]>({
    queryKey: ["examSelection", "subjects", examType],
    queryFn: async () => {
      const { data } = await apiClient.get<SubjectOption[]>(
        EXAM_SELECTION_ENDPOINTS.SUBJECTS(examType)
      );
      return data;
    },
    enabled: !!examType,
    staleTime: 1000 * 60 * 60,
  });
};

export const useProfessionalHierarchy = (examType: string) => {
  return useQuery<import("@/api/types/exam.types").ProfessionalHierarchyResponse>({
    queryKey: ["examSelection", "professional-hierarchy", examType],
    queryFn: async () => {
      const { data } = await apiClient.get<import("@/api/types/exam.types").ProfessionalHierarchyResponse>(
        EXAM_SELECTION_ENDPOINTS.PROFESSIONAL_HIERARCHY(examType)
      );
      if (import.meta.env.DEV) {
        console.info("[exam-debug] professional hierarchy", {
          examType,
          trackCount: data.professionalTracks?.length ?? 0,
          tracks: data.professionalTracks?.map((track) => ({
            id: track.id,
            name: track.name,
            componentCount: track.components?.length ?? 0,
            components: track.components?.map((component) => ({
              id: component.id,
              name: component.name,
              kind: component.kind,
              domainCount: component.domains?.length ?? 0,
              domains: component.domains?.map((domain) => ({
                id: domain.id,
                name: domain.name,
              })),
            })),
          })),
        });
      }
      return data;
    },
    enabled: !!examType,
    staleTime: 1000 * 60 * 60,
  });
};

// ==================== MUTATIONS ====================

// Start practice session
export const useStartPractice = () => {
  const { startExam } = useExamStore();

  return useMutation<
    StartExamResponse,
    AxiosError<ApiError>,
    StartPracticeRequest
  >({
    mutationFn: async (request) => {
      try {
        const { data } = await apiClient.post<StartExamResponse>(
          EXAM_ENDPOINTS.PRACTICE_START,
          request
        );
        return data;
      } catch (error: any) {
        const status = error?.response?.status;
        const msg = error?.response?.data?.message;
        if (status === 403) {
          if (msg?.includes("active subscription")) {
            throw new Error("You do not have an active subscription for this content.");
          }
          if (msg?.includes("limited to exam year")) {
            const yearMatch = msg.match(/year (\d{4})/);
            const year = yearMatch ? yearMatch[1] : "the configured";
            throw new Error(`Practice is only available for ${year} questions.`);
          }
          if (msg?.includes("has not been configured")) {
            throw new Error("Trial practice is not available yet. Please try again later.");
          }
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Extract questions from ExamQuestion[] wrapper
      const questions = data.exam.questions.map((eq) => eq.question);
      startExam(
        data as unknown as ExamAttempt,
        questions,
        data.exam.durationMinutes
      );
    },
  });
};

// Configure practice
export const useConfigurePractice = () => {
  const { startExam } = useExamStore();

  return useMutation<
    StartExamResponse,
    AxiosError<ApiError>,
    ConfigurePracticeRequest
  >({
    mutationFn: async (config) => {
      try {
        const { data } = await apiClient.post<StartExamResponse>(
          EXAM_ENDPOINTS.PRACTICE_CONFIGURE,
          config
        );
        return data;
      } catch (error: any) {
        const status = error?.response?.status;
        const msg = error?.response?.data?.message;
        if (status === 403) {
          if (msg?.includes("active subscription")) {
            throw new Error("You do not have an active subscription for this content.");
          }
          if (msg?.includes("limited to exam year")) {
            const yearMatch = msg.match(/year (\d{4})/);
            const year = yearMatch ? yearMatch[1] : "the configured";
            throw new Error(`Practice is only available for ${year} questions.`);
          }
          if (msg?.includes("has not been configured")) {
            throw new Error("Trial practice is not available yet. Please try again later.");
          }
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Extract questions from ExamQuestion[] wrapper
      const questions = data.exam.questions.map((eq) => eq.question);
      startExam(
        data as unknown as ExamAttempt,
        questions,
        data.exam.durationMinutes
      );
    },
  });
};

// Start a specific exam
export const useStartExam = () => {
  const { startExam } = useExamStore();

  return useMutation<StartExamResponse, AxiosError<ApiError>, string>({
    mutationFn: async (examId) => {
      const { data } = await apiClient.post<StartExamResponse>(
        EXAM_ENDPOINTS.START(examId)
      );
      return data;
    },
    onSuccess: (data) => {
      // Extract questions from ExamQuestion[] wrapper
      const questions = data.exam.questions.map((eq) => eq.question);
      startExam(
        data as unknown as ExamAttempt,
        questions,
        data.exam.durationMinutes
      );
    },
  });
};

// Submit a response
export const useSubmitResponse = (isTrial?: boolean, entitlementId?: string) => {
  const { submitResponse } = useExamStore();

  return useMutation<
    AttemptResponse,
    AxiosError<ApiError>,
    { attemptId: string; request: SubmitResponseRequest }
  >({
    mutationFn: async ({ attemptId, request }) => {
      const endpoint = isTrial && entitlementId
        ? `/student/trials/${entitlementId}/attempts/${attemptId}/responses`
        : EXAM_ENDPOINTS.SUBMIT_RESPONSE(attemptId);
        
      const { data } = await apiClient.post<AttemptResponse>(
        endpoint,
        request
      );
      return data;
    },
    onSuccess: (data) => {
      submitResponse(data.questionId, data);
    },
  });
};

// Submit responses in bulk (for completing exams)
export const useSubmitResponsesBulk = (isTrial?: boolean, entitlementId?: string) => {
  const queryClient = useQueryClient();
  const { submitResponse, clearExam } = useExamStore();

  return useMutation<
    SubmitResponsesBulkResponse,
    AxiosError<ApiError>,
    { attemptId: string; request: SubmitResponsesBulkRequest }
  >({
    mutationFn: async ({ attemptId, request }) => {
      if (isTrial && entitlementId) {
        for (const response of request.responses) {
          await apiClient.post(
            `/student/trials/${entitlementId}/attempts/${attemptId}/responses`,
            response,
          );
        }
        if (request.complete) {
          await apiClient.post(
            `/student/trials/${entitlementId}/attempts/${attemptId}/submit`,
          );
        }
        // Save-answer responses are not documented as graded AttemptResponses.
        return { responses: [] } as unknown as SubmitResponsesBulkResponse;
      }

      const { data } = await apiClient.post<SubmitResponsesBulkResponse>(
        EXAM_ENDPOINTS.SUBMIT_RESPONSES_BULK(attemptId),
        request
      );
      return data;
    },
    onSuccess: (data, variables) => {
      // Update store with all submitted responses
      data.responses?.forEach((response) => {
        submitResponse(response.questionId, response);
      });
      // If this was a completing bulk submit, clear exam state and invalidate caches
      if (variables.request.complete) {
        if (isTrial) {
          queryClient.invalidateQueries({ queryKey: ["trialAttempts"] });
          queryClient.invalidateQueries({ queryKey: ["trialAvailability"] });
        }
        clearExam();
        queryClient.invalidateQueries({ queryKey: ["examHistory"] });
        queryClient.invalidateQueries({ queryKey: ["progress"] });
      }
    },
  });
};

// Pause exam
export const usePauseExam = (isTrial?: boolean, entitlementId?: string) => {
  const { pauseTimer } = useExamStore();

  return useMutation<ExamAttempt, AxiosError<ApiError>, string>({
    mutationFn: async (attemptId) => {
      const endpoint = isTrial && entitlementId
        ? TRIAL_ENDPOINTS.PAUSE(entitlementId, attemptId)
        : EXAM_ENDPOINTS.PAUSE(attemptId);
      const { data } = await apiClient.patch<ExamAttempt>(endpoint);
      return data;
    },
    onSuccess: () => {
      pauseTimer();
    },
  });
};

// Resume exam
export const useResumeExam = (isTrial?: boolean, entitlementId?: string) => {
  const { resumeTimer } = useExamStore();

  return useMutation<ExamAttempt, AxiosError<ApiError>, string>({
    mutationFn: async (attemptId) => {
      const endpoint = isTrial && entitlementId
        ? TRIAL_ENDPOINTS.RESUME(entitlementId, attemptId)
        : EXAM_ENDPOINTS.RESUME(attemptId);
      const { data } = await apiClient.patch<ExamAttempt>(endpoint);
      return data;
    },
    onSuccess: () => {
      resumeTimer();
    },
  });
};

// Complete exam
export const useCompleteExam = (isTrial?: boolean, entitlementId?: string) => {
  const queryClient = useQueryClient();
  const { clearExam } = useExamStore();

  return useMutation<ExamAttempt, AxiosError<ApiError>, string>({
    mutationFn: async (attemptId) => {
      const endpoint = isTrial && entitlementId
        ? `/student/trials/${entitlementId}/attempts/${attemptId}/submit`
        : EXAM_ENDPOINTS.COMPLETE(attemptId);
        
      const { data } = await apiClient.post<ExamAttempt>(
        endpoint
      );
      return data;
    },
    onSuccess: () => {
      clearExam();
      queryClient.invalidateQueries({ queryKey: ["examHistory"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      if (isTrial) {
        queryClient.invalidateQueries({ queryKey: ["trialAttempts"] });
        queryClient.invalidateQueries({ queryKey: ["trialAvailability"] });
      }
    },
  });
};

// Toggle bookmark
export const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { bookmarked: boolean },
    AxiosError<ApiError>,
    ToggleBookmarkRequest
  >({
    mutationFn: async (request) => {
      const { data } = await apiClient.post(EXAM_ENDPOINTS.BOOKMARKS, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
};

// Report question
export const useReportQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string },
    AxiosError<ApiError>,
    ReportQuestionRequest
  >({
    mutationFn: async (request) => {
      const { data } = await apiClient.post(EXAM_ENDPOINTS.REPORTS, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

// ==================== REVIEW ====================

export const useExamReview = (attemptId: string, enabledOverride: boolean = true) => {
  return useQuery<ExamReviewResponse>({
    queryKey: ["examReview", attemptId],
    queryFn: async () => {
      const { data } = await apiClient.get<ExamReviewResponse>(
        EXAM_ENDPOINTS.REVIEW(attemptId)
      );
      return data;
    },
    enabled: !!attemptId && enabledOverride,
  });
};

// ==================== TRIAL ATTEMPTS ====================

export const useTrialAttempts = (entitlementId: string) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<any[]>({ // Assuming it returns array of attempts
    queryKey: ["trialAttempts", entitlementId],
    queryFn: async () => {
      const { data } = await apiClient.get<any[]>(
        `/student/trials/${entitlementId}/attempts`
      );
      return data;
    },
    enabled: isAuthenticated && !!entitlementId,
  });
};

export const useStartTrialAttempt = () => {
  const { startExam } = useExamStore();
  const queryClient = useQueryClient();

  return useMutation<any, AxiosError<ApiError>, string>({
    mutationFn: async (entitlementId: string) => {
      const { data } = await apiClient.post<any>(
        `/student/trials/${entitlementId}/attempts`
      );
      return data;
    },
    onSettled: (_data, _error, entitlementId) => {
      queryClient.invalidateQueries({ queryKey: ["trialAttempts", entitlementId] });
      queryClient.invalidateQueries({ queryKey: ["trialAvailability"] });
    },
    onSuccess: (data) => {
      // Assuming data structure matches ExamAttempt response for standard exams
      if (data.exam && data.exam.questions) {
        const questions = data.exam.questions.map((eq: any) => eq.question);
        startExam(
          data as unknown as ExamAttempt,
          questions,
          data.exam.durationMinutes
        );
      }
    },
  });
};

export const useReviewTrialAttempt = (entitlementId: string, attemptId: string, enabledOverride: boolean = true) => {
  return useQuery<any>({
    queryKey: ["trialReview", entitlementId, attemptId],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        `/student/trials/${entitlementId}/attempts/${attemptId}/review`
      );
      return data;
    },
    enabled: !!entitlementId && !!attemptId && enabledOverride,
  });
};

