import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { AUTH_ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/stores/authStore";
import { useExamStore } from "@/stores/examStore";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  const clearExam = useExamStore((state) => state.clearExam);

  return useMutation<void, AxiosError<ApiError>>({
    mutationFn: async () => {
      const currentRefreshToken = useAuthStore.getState().refreshToken;
      if (currentRefreshToken) {
        await apiClient.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken: currentRefreshToken });
      }
    },
    onSettled: () => {
      logout();
      clearExam();
      queryClient.clear();
    },
  });
};
