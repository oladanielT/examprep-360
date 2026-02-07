import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { EXAM_ENDPOINTS, EXAM_SELECTION_ENDPOINTS } from "@/api/endpoints";
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
      // Store in Zustand for persistence
      setPreferences(data);
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes - refetch periodically
  });
};

// Fetch available exams (for /tests/exams page - list of exams filtered by subject, year, etc.)
export const useAvailableExams = (params: AvailableExamsParams) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<AvailableExamsResponse>({
    queryKey: ["availableExams", params],
    queryFn: async () => {
      const { data } = await apiClient.get<AvailableExamsResponse>(
        EXAM_ENDPOINTS.AVAILABLE,
        { params }
      );
      return data;
    },
    enabled: isAuthenticated,
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
      const { data } = await apiClient.post<StartExamResponse>(
        EXAM_ENDPOINTS.PRACTICE_START,
        request
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

// Configure practice
export const useConfigurePractice = () => {
  const { startExam } = useExamStore();

  return useMutation<
    StartExamResponse,
    AxiosError<ApiError>,
    ConfigurePracticeRequest
  >({
    mutationFn: async (config) => {
      const { data } = await apiClient.post<StartExamResponse>(
        EXAM_ENDPOINTS.PRACTICE_CONFIGURE,
        config
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
export const useSubmitResponse = () => {
  const { submitResponse } = useExamStore();

  return useMutation<
    AttemptResponse,
    AxiosError<ApiError>,
    { attemptId: string; request: SubmitResponseRequest }
  >({
    mutationFn: async ({ attemptId, request }) => {
      const { data } = await apiClient.post<AttemptResponse>(
        EXAM_ENDPOINTS.SUBMIT_RESPONSE(attemptId),
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
export const useSubmitResponsesBulk = () => {
  const queryClient = useQueryClient();
  const { submitResponse, clearExam } = useExamStore();

  return useMutation<
    SubmitResponsesBulkResponse,
    AxiosError<ApiError>,
    { attemptId: string; request: SubmitResponsesBulkRequest }
  >({
    mutationFn: async ({ attemptId, request }) => {
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
        clearExam();
        queryClient.invalidateQueries({ queryKey: ["examHistory"] });
        queryClient.invalidateQueries({ queryKey: ["progress"] });
      }
    },
  });
};

// Pause exam
export const usePauseExam = () => {
  const { pauseTimer } = useExamStore();

  return useMutation<ExamAttempt, AxiosError<ApiError>, string>({
    mutationFn: async (attemptId) => {
      const { data } = await apiClient.patch<ExamAttempt>(
        EXAM_ENDPOINTS.PAUSE(attemptId)
      );
      return data;
    },
    onSuccess: () => {
      pauseTimer();
    },
  });
};

// Resume exam
export const useResumeExam = () => {
  const { resumeTimer } = useExamStore();

  return useMutation<ExamAttempt, AxiosError<ApiError>, string>({
    mutationFn: async (attemptId) => {
      const { data } = await apiClient.patch<ExamAttempt>(
        EXAM_ENDPOINTS.RESUME(attemptId)
      );
      return data;
    },
    onSuccess: () => {
      resumeTimer();
    },
  });
};

// Complete exam
export const useCompleteExam = () => {
  const queryClient = useQueryClient();
  const { clearExam } = useExamStore();

  return useMutation<ExamAttempt, AxiosError<ApiError>, string>({
    mutationFn: async (attemptId) => {
      const { data } = await apiClient.post<ExamAttempt>(
        EXAM_ENDPOINTS.COMPLETE(attemptId)
      );
      return data;
    },
    onSuccess: () => {
      clearExam();
      queryClient.invalidateQueries({ queryKey: ["examHistory"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
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

export const useExamReview = (attemptId: string) => {
  return useQuery<ExamReviewResponse>({
    queryKey: ["examReview", attemptId],
    queryFn: async () => {
      const { data } = await apiClient.get<ExamReviewResponse>(
        EXAM_ENDPOINTS.REVIEW(attemptId)
      );
      return data;
    },
    enabled: !!attemptId,
  });
};
