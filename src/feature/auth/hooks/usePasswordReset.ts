import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { AUTH_ENDPOINTS } from "@/api/endpoints";
import type {
  PasswordResetRequestPayload,
  PasswordResetVerifyPayload,
  PasswordResetPayload,
  PasswordResetVerifyResponse,
} from "@/api/types";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

export const usePasswordResetRequest = () => {
  return useMutation<{ message: string }, AxiosError<ApiError>, PasswordResetRequestPayload>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post(
        AUTH_ENDPOINTS.PASSWORD_RESET_REQUEST,
        payload
      );
      return data;
    },
  });
};

export const usePasswordResetVerify = () => {
  return useMutation<PasswordResetVerifyResponse, AxiosError<ApiError>, PasswordResetVerifyPayload>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<PasswordResetVerifyResponse>(
        AUTH_ENDPOINTS.PASSWORD_RESET_VERIFY,
        payload
      );
      return data;
    },
  });
};

export const usePasswordReset = () => {
  return useMutation<{ message: string }, AxiosError<ApiError>, PasswordResetPayload>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post(
        AUTH_ENDPOINTS.PASSWORD_RESET,
        payload
      );
      return data;
    },
  });
};
