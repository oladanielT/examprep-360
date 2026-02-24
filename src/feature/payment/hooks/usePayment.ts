import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { PAYMENT_ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/stores/authStore";
import type {
  PaymentPlan,
  PricingPreview,
  InitializePaymentRequest,
  InitializePaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  RedeemLicenseRequest,
  RedeemLicenseResponse,
  StartTrialRequest,
  StartTrialResponse,
  InstitutionalCode,
  CodeRedemption,
} from "@/api/types";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

// ==================== QUERIES ====================

// Fetch payment plans
export const usePaymentPlans = (
  schoolType: string,
  examType: string,
  subscriptionType: "INDIVIDUAL" | "BODY" = "INDIVIDUAL"
) => {
  return useQuery<PaymentPlan[]>({
    queryKey: ["paymentPlans", schoolType, examType, subscriptionType],
    queryFn: async () => {
      const { data } = await apiClient.get<PaymentPlan[]>(
        PAYMENT_ENDPOINTS.PLANS,
        {
          params: { schoolType, examType, subscriptionType },
        }
      );
      return data;
    },
    enabled: !!schoolType && !!examType,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Fetch pricing preview
export const usePricingPreview = (
  planId: string,
  numberOfStudents?: number
) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<PricingPreview>({
    queryKey: ["pricingPreview", planId, numberOfStudents],
    queryFn: async () => {
      const { data } = await apiClient.get<PricingPreview>(
        PAYMENT_ENDPOINTS.PRICING_PREVIEW,
        {
          params: { planId, numberOfStudents },
        }
      );
      return data;
    },
    enabled: isAuthenticated && !!planId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Fetch institutional codes (for institutional users)
export const useInstitutionalCodes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<InstitutionalCode[]>({
    queryKey: ["institutionalCodes"],
    queryFn: async () => {
      const { data } = await apiClient.get<InstitutionalCode[]>(
        PAYMENT_ENDPOINTS.INSTITUTIONAL_CODES
      );
      return data;
    },
    enabled: isAuthenticated,
  });
};

// Fetch redemption history for a specific license code
export const useCodeRedemptions = (codeId: string) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<CodeRedemption[]>({
    queryKey: ["codeRedemptions", codeId],
    queryFn: async () => {
      const { data } = await apiClient.get<CodeRedemption[]>(
        PAYMENT_ENDPOINTS.CODE_REDEMPTIONS(codeId)
      );
      return data;
    },
    enabled: isAuthenticated && !!codeId,
  });
};

// ==================== MUTATIONS ====================

// Initialize payment
export const useInitializePayment = () => {
  return useMutation<
    InitializePaymentResponse,
    AxiosError<ApiError>,
    InitializePaymentRequest
  >({
    mutationFn: async (request) => {
      const { data } = await apiClient.post<InitializePaymentResponse>(
        PAYMENT_ENDPOINTS.INITIALIZE,
        request
      );
      return data;
    },
  });
};

// Verify payment
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    VerifyPaymentResponse,
    AxiosError<ApiError>,
    VerifyPaymentRequest
  >({
    mutationFn: async (request) => {
      const { data } = await apiClient.post<VerifyPaymentResponse>(
        PAYMENT_ENDPOINTS.VERIFY,
        request
      );
      return data;
    },
    onSuccess: () => {
      // Invalidate user profile to reflect subscription changes
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

// Redeem license code
export const useRedeemLicense = () => {
  const queryClient = useQueryClient();

  return useMutation<
    RedeemLicenseResponse,
    AxiosError<ApiError>,
    RedeemLicenseRequest
  >({
    mutationFn: async (request) => {
      const { data } = await apiClient.post<RedeemLicenseResponse>(
        PAYMENT_ENDPOINTS.REDEEM_LICENSE,
        request
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

// Start free trial
export const useStartTrial = () => {
  const queryClient = useQueryClient();

  return useMutation<
    StartTrialResponse,
    AxiosError<ApiError>,
    StartTrialRequest
  >({
    mutationFn: async (request) => {
      const { data } = await apiClient.post<StartTrialResponse>(
        PAYMENT_ENDPOINTS.START_TRIAL,
        request
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
