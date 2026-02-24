import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { NOTIFICATION_ENDPOINTS } from "@/api/endpoints";
import type {
  NotificationsResponse,
  NotificationType,
} from "@/api/types";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

// ==================== QUERIES ====================

export const useNotifications = (
  page: number = 1,
  limit: number = 10,
  type?: NotificationType
) => {
  return useQuery<NotificationsResponse>({
    queryKey: ["notifications", page, limit, type],
    queryFn: async () => {
      const { data } = await apiClient.get<NotificationsResponse>(
        NOTIFICATION_ENDPOINTS.LIST,
        { params: { page, limit, ...(type && { type }) } }
      );
      return data;
    },
  });
};

// ==================== MUTATIONS ====================

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, string>({
    mutationFn: async (notificationId) => {
      await apiClient.patch(NOTIFICATION_ENDPOINTS.MARK_READ(notificationId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, void>({
    mutationFn: async () => {
      await apiClient.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
