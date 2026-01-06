import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { AUTH_ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/stores/authStore";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout, refreshToken } = useAuthStore();

  return useMutation<void, AxiosError<ApiError>>({
    mutationFn: async () => {
      if (refreshToken) {
        await apiClient.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken });
      }
    },
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
};
