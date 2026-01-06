import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { AUTH_ENDPOINTS } from "@/api/endpoints";
import type { RegisterRequest, RegisterResponse } from "@/api/types";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

export const useRegister = () => {
  return useMutation<RegisterResponse, AxiosError<ApiError>, RegisterRequest>({
    mutationFn: async (userData) => {
      const { data } = await apiClient.post<RegisterResponse>(
        AUTH_ENDPOINTS.REGISTER,
        userData
      );
      return data;
    },
  });
};
