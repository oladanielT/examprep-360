import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { EXAM_ENDPOINTS } from "@/api/endpoints";
import type {
  PausedExam,
  ExamHistoryResponse,
  ExamHistoryParams,
  Bookmark,
  QuestionReport
} from "@/api/types/exam.types";

// Fetch paused exams
export const usePausedExams = () => {
  return useQuery<PausedExam[]>({
    queryKey: ["paused-exams"],
    queryFn: async () => {
      const { data } = await apiClient.get(EXAM_ENDPOINTS.PAUSED);
      // Handle various response structures
      if (Array.isArray(data)) return data;
      if (data.data && Array.isArray(data.data)) return data.data;
      if (data.exams && Array.isArray(data.exams)) return data.exams;
      return [];
    },
    staleTime: 0,
    refetchOnMount: true,
  });
};

// Fetch exam history (completed exams)
export const useExamHistory = (params?: ExamHistoryParams) => {
  return useQuery<ExamHistoryResponse>({
    queryKey: ["exam-history", params],
    queryFn: async () => {
      const { data } = await apiClient.get(EXAM_ENDPOINTS.HISTORY, { params });
      return data;
    },
    staleTime: 0,
    refetchOnMount: true,
  });
};

// Fetch bookmarked questions
export const useBookmarkedQuestions = () => {
  return useQuery<Bookmark[]>({
    queryKey: ["bookmarked-questions"],
    queryFn: async () => {
      const { data } = await apiClient.get(EXAM_ENDPOINTS.BOOKMARKS);
      // Bookmarks return paginated response with items array
      if (data.items && Array.isArray(data.items)) return data.items;
      if (Array.isArray(data)) return data;
      return [];
    },
    staleTime: 0,
    refetchOnMount: true,
  });
};

// Fetch reported questions
export const useReportedQuestions = () => {
  return useQuery<QuestionReport[]>({
    queryKey: ["reported-questions"],
    queryFn: async () => {
      const { data } = await apiClient.get(EXAM_ENDPOINTS.REPORTS);
      // Reports return direct array
      if (Array.isArray(data)) return data;
      if (data.data && Array.isArray(data.data)) return data.data;
      return [];
    },
    staleTime: 0,
    refetchOnMount: true,
  });
};
