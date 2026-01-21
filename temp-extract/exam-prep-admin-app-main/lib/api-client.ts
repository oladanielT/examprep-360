// @/config/api-client.ts

import { env } from "@/config/env";
import { paths } from "@/config/paths";
import Axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

// ============ TYPES ============
export type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined | null>;
  useAuth?: boolean; // Flag to include bearer token (default: true)
  timeout?: number; // Custom timeout for specific requests
};

export interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

interface ApiErrorResponse {
  message?: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  useAuth?: boolean;
}

// ============ TOKEN MANAGEMENT ============

const TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get refresh token from localStorage
 */
function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Store tokens in localStorage
 */
function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Clear all tokens
 */
function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if token is expired (basic check)
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp: number };
    const expiresIn = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiresIn;
  } catch {
    return true;
  }
}

// ============ UTILITIES ============

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      console.warn("No refresh token available");
      return false;
    }

    // Call refresh endpoint without auth interceptor
    const response = await axiosInstance.post<unknown, RefreshTokenResponse>(
      "/admin/auth/refresh",
      { refreshToken },
      {
        headers: {
          // Don't add Authorization header for refresh
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (response?.accessToken && response?.refreshToken) {
      // Store new tokens
      setTokens(response.accessToken, response.refreshToken);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return false;
  }
}

/**
 * Handle API errors consistently
 */
function handleApiError(error: AxiosError<ApiErrorResponse>): void {
  const message =
    error.response?.data?.message ||
    error.message ||
    "An unexpected error occurred";

  // Only show toast on client side
  if (typeof window !== "undefined") {
    toast.error(message);
  }
}

/**
 * Redirect to login
 */
function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(window.location.search);
    const redirectTo =
      searchParams.get("redirectTo") || window.location.pathname;
    window.location.href = paths.auth.signIn.getHref(redirectTo);
  }
}

// ============ AXIOS INSTANCE ============

/**
 * Axios request interceptor - Add auth token
 */
function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  // Set default headers
  if (config.headers) {
    config.headers.Accept = "application/json";

    // Only set Content-Type if not FormData (let browser set it with boundary for FormData)
    if (config.data instanceof FormData) {
      // Remove Content-Type header for FormData to let browser set it with boundary
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }
  }

  // Add authorization token if useAuth is not explicitly false
  const useAuth = (config as ExtendedAxiosRequestConfig).useAuth !== false;
  if (useAuth) {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  config.withCredentials = true;
  return config;
}

/**
 * Create Axios instance
 */
export const axiosInstance = Axios.create({
  baseURL: env.API_URL,
  timeout: 30000,
  // Don't set default Content-Type here, let the interceptor handle it
  headers: {
    Accept: "application/json",
  },
});

// Add request interceptor
axiosInstance.interceptors.request.use(authRequestInterceptor, (error) => {
  return Promise.reject(error);
});

// Track if we're currently refreshing token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null | undefined) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: Error | null, token?: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

/**
 * Add response interceptor - Handle 401 and retry
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the data directly for cleaner API
    return response.data;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as
      | ExtendedAxiosRequestConfig
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Skip token refresh for login/register endpoints
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh");

    // If 401 and not already retried, try to refresh token (but not for auth endpoints)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<string | null | undefined>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err: unknown) => {
            redirectToLogin();
            return Promise.reject(err);
          });
      }

      // Start token refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
          const newToken = getAccessToken();
          processQueue(null, newToken);

          // Retry original request with new token
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          return axiosInstance(originalRequest);
        } else {
          // Refresh failed, redirect to login
          processQueue(new Error("Token refresh failed"), null);
          clearTokens();
          redirectToLogin();
          return Promise.reject(error);
        }
      } catch (err) {
        processQueue(
          err instanceof Error ? err : new Error("Token refresh failed"),
          null
        );
        clearTokens();
        redirectToLogin();
        return Promise.reject(err);
      }
    }

    // For other errors, show error message
    handleApiError(error);

    // Create a more structured error
    const apiError: ApiError = new Error(
      error.response?.data?.message || error.message
    );
    apiError.status = error.response?.status;
    apiError.data = error.response?.data;

    return Promise.reject(apiError);
  }
);

// ============ API CLIENT ============

/**
 * Merge request options with custom config
 */
function buildAxiosConfig(
  options?: RequestOptions
): AxiosRequestConfig & { useAuth?: boolean } {
  return {
    headers: options?.headers,
    params: options?.params,
    timeout: options?.timeout,
    // Pass useAuth through config so interceptor can access it
    ...(options?.useAuth !== undefined && { useAuth: options.useAuth }),
  };
}

/**
 * Unified API client using Axios
 */
export const api = {
  /**
   * GET request
   * @param url - API endpoint
   * @param options - Request options (useAuth defaults to true)
   */
  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return axiosInstance.get<unknown, T>(url, buildAxiosConfig(options));
  },

  /**
   * POST request
   * @param url - API endpoint
   * @param body - Request body
   * @param options - Request options (useAuth defaults to true)
   */
  async post<T>(
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return axiosInstance.post<unknown, T>(url, body, buildAxiosConfig(options));
  },

  /**
   * PUT request
   * @param url - API endpoint
   * @param body - Request body
   * @param options - Request options (useAuth defaults to true)
   */
  async put<T>(
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return axiosInstance.put<unknown, T>(url, body, buildAxiosConfig(options));
  },

  /**
   * PATCH request
   * @param url - API endpoint
   * @param body - Request body
   * @param options - Request options (useAuth defaults to true)
   */
  async patch<T>(
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return axiosInstance.patch<unknown, T>(
      url,
      body,
      buildAxiosConfig(options)
    );
  },

  /**
   * DELETE request
   * @param url - API endpoint
   * @param options - Request options (useAuth defaults to true)
   */
  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return axiosInstance.delete<unknown, T>(url, buildAxiosConfig(options));
  },
};

/**
 * Export token management functions for auth module
 */
export const tokenManager = {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isTokenExpired,
};

export default api;
