import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { EXAM_SELECTION_ENDPOINTS, PAYMENT_ENDPOINTS } from "@/api/endpoints";
import type { UserSubscription, ChangeSubscriptionSubjectsRequest } from "@/api/types";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

export const useSubscriptions = () => {
  return useQuery<UserSubscription[]>({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const { data } = await apiClient.get<UserSubscription[]>(
        EXAM_SELECTION_ENDPOINTS.SUBSCRIPTIONS
      );
      return data;
    },
  });
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      await apiClient.delete(EXAM_SELECTION_ENDPOINTS.DELETE_SUBSCRIPTION(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
};

export const useSwitchSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      await apiClient.post(EXAM_SELECTION_ENDPOINTS.SWITCH(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["examPreferences"] });
    },
  });
};

export const useChangeSubscriptionSubjects = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AxiosError<ApiError>,
    { id: string; request: ChangeSubscriptionSubjectsRequest }
  >({
    mutationFn: async ({ id, request }) => {
      await apiClient.patch(PAYMENT_ENDPOINTS.CHANGE_SUBJECTS(id), request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["examPreferences"] });
    },
  });
};
