import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { REFERRAL_ENDPOINTS } from "@/api/endpoints";
import type { ReferralData } from "@/api/types";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

// ==================== QUERIES ====================

export const useReferralData = () => {
  return useQuery<ReferralData>({
    queryKey: ["referralData"],
    queryFn: async () => {
      const { data } = await apiClient.get<ReferralData>(
        REFERRAL_ENDPOINTS.MY_CODE
      );
      return data;
    },
  });
};

// ==================== MUTATIONS ====================

export const useValidateReferral = () => {
  return useMutation<
    { valid: boolean; message: string },
    AxiosError<ApiError>,
    { code: string }
  >({
    mutationFn: async (request) => {
      const { data } = await apiClient.post(
        REFERRAL_ENDPOINTS.VALIDATE,
        request
      );
      return data;
    },
  });
};

export const useClaimReward = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string },
    AxiosError<ApiError>,
    string
  >({
    mutationFn: async (rewardId) => {
      const { data } = await apiClient.post(
        REFERRAL_ENDPOINTS.CLAIM_REWARD(rewardId)
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referralData"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });
};
