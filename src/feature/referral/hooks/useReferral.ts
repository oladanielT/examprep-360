import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { REFERRAL_ENDPOINTS } from "@/api/endpoints";
import type { ReferralData, ReferralStats } from "@/api/types";
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

// Stats live on a separate endpoint. Permissive type for now — we'll
// tighten ReferralStats once we see the real response shape.
export const useReferralStats = () => {
  return useQuery<ReferralStats>({
    queryKey: ["referralStats"],
    queryFn: async () => {
      const { data } = await apiClient.get<ReferralStats>(
        REFERRAL_ENDPOINTS.STATS
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
    { referralCode: string }
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
