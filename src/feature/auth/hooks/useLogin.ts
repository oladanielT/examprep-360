import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { AUTH_ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/stores/authStore";
import type { LoginRequest, AuthResponse } from "@/api/types";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setTokens, setUser } = useAuthStore();

  return useMutation<AuthResponse, AxiosError<ApiError>, LoginRequest>({
    mutationFn: async (credentials) => {
      const { data } = await apiClient.post<AuthResponse>(
        AUTH_ENDPOINTS.LOGIN,
        credentials
      );
      return data;
    },
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
