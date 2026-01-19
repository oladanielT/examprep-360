import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { TUTORIALS_ENDPOINTS, TASKS_ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/stores/authStore";
import type {
  Tutorial,
  TutorialListParams,
  Task,
  TaskListParams,
  UpdateTutorialProgressRequest,
  SubmitTutorialQuestionsRequest,
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

  return useQuery<Tutorial[]>({
    queryKey: ["tutorials", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Tutorial[]>(TUTORIALS_ENDPOINTS.LIST, {
        params,
      });
      return data;
    },
    enabled: isAuthenticated,
  });
};

export const useTutorial = (id: string) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<Tutorial>({
    queryKey: ["tutorials", id],
    queryFn: async () => {
      const { data } = await apiClient.get<Tutorial>(TUTORIALS_ENDPOINTS.DETAILS(id));
      return data;
    },
    enabled: isAuthenticated && !!id,
  });
};

// ==================== TUTORIAL MUTATIONS ====================

export const useUpdateTutorialProgress = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Tutorial,
    AxiosError<ApiError>,
    { id: string; progress: UpdateTutorialProgressRequest }
  >({
    mutationFn: async ({ id, progress }) => {
      const { data } = await apiClient.patch<Tutorial>(
        TUTORIALS_ENDPOINTS.UPDATE_PROGRESS(id),
        progress
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["tutorials", variables.id], data);
      queryClient.invalidateQueries({ queryKey: ["tutorials"] });
    },
  });
};

export const useSubmitTutorialQuestions = () => {
  return useMutation<
    { score: number },
    AxiosError<ApiError>,
    { id: string; answers: SubmitTutorialQuestionsRequest }
  >({
    mutationFn: async ({ id, answers }) => {
      const { data } = await apiClient.post(
        TUTORIALS_ENDPOINTS.SUBMIT_QUESTIONS(id),
        answers
      );
      return data;
    },
  });
};

export const useToggleTutorialBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation<{ bookmarked: boolean }, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      const { data } = await apiClient.post(TUTORIALS_ENDPOINTS.BOOKMARK(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutorials"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarkedTutorials"] });
    },
  });
};

// Fetch bookmarked tutorials
export const useBookmarkedTutorials = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<Tutorial[]>({
    queryKey: ["bookmarkedTutorials"],
    queryFn: async () => {
      const { data } = await apiClient.get<Tutorial[]>(TUTORIALS_ENDPOINTS.BOOKMARKS);
      return data;
    },
    enabled: isAuthenticated,
  });
};

// Mark tutorial as complete
export const useCompleteTutorial = () => {
  const queryClient = useQueryClient();

  return useMutation<Tutorial, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      const { data } = await apiClient.post<Tutorial>(TUTORIALS_ENDPOINTS.COMPLETE(id));
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["tutorials"] });
      queryClient.invalidateQueries({ queryKey: ["tutorials", id] });
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
