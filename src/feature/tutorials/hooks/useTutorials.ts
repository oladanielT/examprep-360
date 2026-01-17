import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { TUTORIALS_ENDPOINTS, TASKS_ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/stores/authStore";
import type {
  TutorialListItem,
  TutorialListParams,
  TutorialListResponse,
  TutorialDetail,
  BookmarkedTutorial,
  UpdateTutorialProgressRequest,
  UpdateTutorialProgressResponse,
  SubmitTutorialQuestionsRequest,
  SubmitTutorialQuestionsResponse,
  MarkTutorialCompleteResponse,
  ToggleTutorialBookmarkResponse,
  Task,
  TaskListParams,
  SubmitTaskRequest,
} from "@/api/types";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

// ==================== TUTORIAL QUERIES ====================

export const useTutorials = (params: TutorialListParams = {}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<TutorialListItem[]>({
    queryKey: ["tutorials", params],
    queryFn: async () => {
      const { data } = await apiClient.get<TutorialListResponse>(TUTORIALS_ENDPOINTS.LIST, {
        params,
      });
      return data.data;
    },
    enabled: isAuthenticated,
  });
};

export const useTutorial = (id: string) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<TutorialDetail>({
    queryKey: ["tutorials", id],
    queryFn: async () => {
      const { data } = await apiClient.get<TutorialDetail>(TUTORIALS_ENDPOINTS.DETAILS(id));
      return data;
    },
    enabled: isAuthenticated && !!id,
  });
};

export const useBookmarkedTutorials = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<BookmarkedTutorial[]>({
    queryKey: ["tutorials", "bookmarks"],
    queryFn: async () => {
      const { data } = await apiClient.get<BookmarkedTutorial[]>(TUTORIALS_ENDPOINTS.BOOKMARKS);
      return data;
    },
    enabled: isAuthenticated,
  });
};

// ==================== TUTORIAL MUTATIONS ====================

export const useUpdateTutorialProgress = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateTutorialProgressResponse,
    AxiosError<ApiError>,
    { id: string; progress: UpdateTutorialProgressRequest }
  >({
    mutationFn: async ({ id, progress }) => {
      const { data } = await apiClient.patch<UpdateTutorialProgressResponse>(
        TUTORIALS_ENDPOINTS.UPDATE_PROGRESS(id),
        progress
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tutorials", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["tutorials"] });
    },
  });
};

export const useSubmitTutorialQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SubmitTutorialQuestionsResponse,
    AxiosError<ApiError>,
    { id: string; answers: SubmitTutorialQuestionsRequest }
  >({
    mutationFn: async ({ id, answers }) => {
      const { data } = await apiClient.post<SubmitTutorialQuestionsResponse>(
        TUTORIALS_ENDPOINTS.SUBMIT_QUESTIONS(id),
        answers
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tutorials", variables.id] });
    },
  });
};

export const useMarkTutorialComplete = () => {
  const queryClient = useQueryClient();

  return useMutation<
    MarkTutorialCompleteResponse,
    AxiosError<ApiError>,
    string
  >({
    mutationFn: async (id) => {
      const { data } = await apiClient.post<MarkTutorialCompleteResponse>(
        TUTORIALS_ENDPOINTS.COMPLETE(id)
      );
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["tutorials", id] });
      queryClient.invalidateQueries({ queryKey: ["tutorials"] });
    },
  });
};

export const useToggleTutorialBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation<ToggleTutorialBookmarkResponse, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      const { data } = await apiClient.post<ToggleTutorialBookmarkResponse>(
        TUTORIALS_ENDPOINTS.BOOKMARK(id)
      );
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["tutorials", id] });
      queryClient.invalidateQueries({ queryKey: ["tutorials"] });
      queryClient.invalidateQueries({ queryKey: ["tutorials", "bookmarks"] });
    },
  });
};

// ==================== TASK QUERIES ====================

export const useTasks = (params: TaskListParams = {}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<Task[]>({
    queryKey: ["tasks", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Task[]>(TASKS_ENDPOINTS.LIST, {
        params,
      });
      return data;
    },
    enabled: isAuthenticated,
  });
};

export const useTask = (id: string) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<Task>({
    queryKey: ["tasks", id],
    queryFn: async () => {
      const { data } = await apiClient.get<Task>(TASKS_ENDPOINTS.DETAILS(id));
      return data;
    },
    enabled: isAuthenticated && !!id,
  });
};

// ==================== TASK MUTATIONS ====================

export const useCompleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation<Task, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      const { data } = await apiClient.patch<Task>(TASKS_ENDPOINTS.COMPLETE(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useSubmitTask = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Task,
    AxiosError<ApiError>,
    { id: string; submission: SubmitTaskRequest }
  >({
    mutationFn: async ({ id, submission }) => {
      const { data } = await apiClient.post<Task>(
        TASKS_ENDPOINTS.SUBMIT(id),
        submission
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
