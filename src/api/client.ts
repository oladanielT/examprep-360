import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { AUTH_ENDPOINTS } from "@/api/endpoints";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request deduplication - track pending requests
// This prevents duplicate identical GET requests from being sent simultaneously
const pendingRequests = new Map<string, Promise<any>>();

// Generate request key for deduplication
function getRequestKey(config: any): string {
  const { method = 'get', url, params, data } = config;
  return `${method.toUpperCase()}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`;
}

// Create a wrapper around axios to add deduplication
const originalRequest = apiClient.request.bind(apiClient);
apiClient.request = function (config: any) {
  // Only deduplicate GET requests (safe to deduplicate)
  if (config.method?.toLowerCase() === 'get' || !config.method) {
    const requestKey = getRequestKey(config);

    // If there's already a pending request with the same key, return it
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey)!;
    }

    // Create new request and store it
    const requestPromise = originalRequest(config).finally(() => {
      // Clean up after request completes (success or error)
      pendingRequests.delete(requestKey);
    });

    pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  }

  // For non-GET requests, just execute normally (POST/PUT/DELETE may have side effects)
  return originalRequest(config);
} as any;

// Request interceptor - adds auth token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints that should NOT trigger token refresh or redirect on 401
const AUTH_PATHS = Object.values(AUTH_ENDPOINTS).filter(
  (v): v is string => typeof v === "string"
);

// Token refresh mutex -- ensures only one refresh is in-flight at a time
let refreshPromise: Promise<any> | null = null;

// Response interceptor - handles token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestPath = originalRequest?.url || "";

    // Skip redirect logic for auth endpoints (login, register, refresh, password-reset, etc.)
    const isAuthEndpoint = AUTH_PATHS.some((path) => requestPath.includes(path));
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // If 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          // Use mutex to prevent concurrent refresh calls
          if (!refreshPromise) {
            refreshPromise = axios
              .post(`${API_BASE_URL}/user/auth/refresh`, { refreshToken })
              .finally(() => {
                refreshPromise = null;
              });
          }

          const { data } = await refreshPromise;

          if (data?.accessToken && data?.refreshToken) {
            useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return apiClient(originalRequest);
          }

          // Invalid response from refresh endpoint
          useAuthStore.getState().logout();
          window.location.replace("/sign-in");
        } catch {
          refreshPromise = null;
          useAuthStore.getState().logout();
          window.location.replace("/sign-in");
        }
      } else {
        useAuthStore.getState().logout();
        window.location.replace("/sign-in");
      }
    }
    return Promise.reject(error);
  }
);

export { API_BASE_URL };
