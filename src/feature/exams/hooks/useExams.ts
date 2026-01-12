import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { EXAM_ENDPOINTS, EXAM_SELECTION_ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/stores/authStore";
import { useExamStore } from "@/stores/examStore";
import type {
  ExamHistory,
  ExamAttempt,
  Bookmark,
  QuestionReport,
  StartPracticeRequest,
  ConfigurePracticeRequest,
  SubmitResponseRequest,
  ReportQuestionRequest,
  ToggleBookmarkRequest,
  StartExamResponse,
  AttemptResponse,
  ExamCategory,
  ExamSubtype,
  Subject,
} from "@/api/types";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

// ==================== QUERIES ====================

// Fetch exam history
export const useExamHistory = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<ExamHistory>({
    queryKey: ["examHistory"],
    queryFn: async () => {
      const { data } = await apiClient.get<ExamHistory>(EXAM_ENDPOINTS.HISTORY);
      return data;
    },
    enabled: isAuthenticated,
  });
};

// Fetch paused exams
export const usePausedExams = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<ExamAttempt[]>({
    queryKey: ["pausedExams"],
    queryFn: async () => {
      const { data } = await apiClient.get<ExamAttempt[]>(EXAM_ENDPOINTS.PAUSED);
      return data;
    },
    enabled: isAuthenticated,
  });
};

// Fetch bookmarked questions
export const useBookmarks = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<Bookmark[]>({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const { data } = await apiClient.get<Bookmark[]>(EXAM_ENDPOINTS.BOOKMARKS);
      return data;
    },
    enabled: isAuthenticated,
  });
};

// Fetch reported questions
export const useReports = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<QuestionReport[]>({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data } = await apiClient.get<QuestionReport[]>(EXAM_ENDPOINTS.REPORTS);
      return data;
    },
    enabled: isAuthenticated,
  });
};

// Exam Selection Queries
export const useExamCategories = () => {
  return useQuery<ExamCategory[]>({
    queryKey: ["examSelection", "categories"],
    queryFn: async () => {
      const { data } = await apiClient.get<ExamCategory[]>(
        EXAM_SELECTION_ENDPOINTS.CATEGORIES
      );
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useExamTypes = (category: string) => {
  return useQuery<ExamSubtype[]>({
    queryKey: ["examSelection", "examTypes", category],
    queryFn: async () => {
      const { data } = await apiClient.get<ExamSubtype[]>(
        EXAM_SELECTION_ENDPOINTS.EXAM_TYPES(category)
      );
      return data;
    },
    enabled: !!category,
    staleTime: 1000 * 60 * 60,
  });
};

export const useExamSubjects = (examType: string) => {
  return useQuery<Subject[]>({
    queryKey: ["examSelection", "subjects", examType],
    queryFn: async () => {
      const { data } = await apiClient.get<Subject[]>(
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

  return useMutation<StartExamResponse, AxiosError<ApiError>, StartPracticeRequest>({
    mutationFn: async (request) => {
      const { data } = await apiClient.post<StartExamResponse>(
        EXAM_ENDPOINTS.PRACTICE_START,
        request
      );
      return data;
    },
    onSuccess: (data) => {
      startExam(data.attempt, data.questions, data.timeLimit);
    },
  });
};

// Configure practice
export const useConfigurePractice = () => {
  return useMutation<StartExamResponse, AxiosError<ApiError>, ConfigurePracticeRequest>({
    mutationFn: async (config) => {
      const { data } = await apiClient.post<StartExamResponse>(
        EXAM_ENDPOINTS.PRACTICE_CONFIGURE,
        config
      );
      return data;
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
      startExam(data.attempt, data.questions, data.timeLimit);
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

  return useMutation<{ bookmarked: boolean }, AxiosError<ApiError>, ToggleBookmarkRequest>({
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

  return useMutation<{ message: string }, AxiosError<ApiError>, ReportQuestionRequest>({
    mutationFn: async (request) => {
      const { data } = await apiClient.post(EXAM_ENDPOINTS.REPORTS, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};
