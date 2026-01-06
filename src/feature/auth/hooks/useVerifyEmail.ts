import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { AUTH_ENDPOINTS } from "@/api/endpoints";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

// Request OTP to be sent to email (before registration)
export const useRequestEmailOtp = () => {
  return useMutation<{ message: string }, AxiosError<ApiError>, { email: string }>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post(
        AUTH_ENDPOINTS.REQUEST_EMAIL_OTP,
        payload
      );
      return data;
    },
  });
};

// Verify email with OTP (pre/post registration)
export const useVerifyEmail = () => {
  return useMutation<{ message: string; verified: boolean }, AxiosError<ApiError>, { email: string; otp: string }>({
    mutationFn: async (verifyData) => {
      const { data } = await apiClient.post(
        AUTH_ENDPOINTS.VERIFY_EMAIL,
        verifyData
      );
      return data;
    },
  });
};

// Resend verification OTP
export const useResendVerification = () => {
  return useMutation<{ message: string }, AxiosError<ApiError>, { email: string }>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post(
        AUTH_ENDPOINTS.RESEND_VERIFICATION,
        payload
      );
      return data;
    },
  });
};
