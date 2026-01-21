"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api, tokenManager } from "@/lib/api-client";
import { AuthResponse, AdminUser, ApiErrorResponse } from "@/types/api";

// ========== CONSTANTS ==========
const adminQueryKey = ["admin"];

// ========== SCHEMAS ==========
export const loginInputSchema = z.object({
  email: z.string().min(1, "Email required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

// ========== ERROR HANDLING ==========
export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  timestamp?: string;
}

interface ErrorWithResponse {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
  };
  message?: string;
}

const parseError = (error: unknown): AppError => {
  const err = error as ErrorWithResponse;

  if (err?.response?.data?.statusCode) {
    const data = err.response.data;
    return {
      message: data.message || data.error || "An error occurred",
      code: data.error,
      statusCode: data.statusCode,
      timestamp: data.timestamp,
    };
  }

  return {
    message: err?.message || "An unexpected error occurred",
    statusCode: err?.response?.status,
  };
};

// ========== API CALLS ==========
const loginWithEmailAndPassword = (data: LoginInput): Promise<AuthResponse> => {
  return api.post("/admin/auth/login", data, { useAuth: false });
};

const logout = (): Promise<void> => {
  return api.post("/admin/auth/logout", {
    refreshToken: tokenManager.getRefreshToken(),
  });
};

const getAdmin = (): Promise<AdminUser> => {
  return api.get("/admin/auth/profile");
};

// ========== QUERY OPTIONS ==========
export const adminQueryOptions = () => ({
  queryKey: adminQueryKey,
  queryFn: getAdmin,
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 30, // 30 minutes
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
});

// ========== HOOKS ==========

/**
 * Hook for checking if admin is authenticated
 */
export const useAdmin = () => {
  return useQuery({
    ...adminQueryOptions(),
    enabled: typeof window !== "undefined" && !!tokenManager.getAccessToken(),
  });
};

/**
 * Hook for login
 */
export const useLogin = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: AppError) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginWithEmailAndPassword,
    onSuccess: (response) => {
      tokenManager.setTokens(
        response.data.accessToken,
        response.data.refreshToken
      );

      queryClient.setQueryData(adminQueryKey, response.data.admin);

      onSuccess?.();
    },
    onError: (error) => {
      const appError = parseError(error);
      onError?.(appError);
    },
  });
};

/**
 * Hook for logout
 */
export const useLogout = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: AppError) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      tokenManager.clearTokens();
      queryClient.removeQueries({ queryKey: adminQueryKey });
      onSuccess?.();
    },
    onError: (error) => {
      tokenManager.clearTokens();
      queryClient.removeQueries({ queryKey: adminQueryKey });
      const appError = parseError(error);
      onError?.(appError);
    },
  });
};
