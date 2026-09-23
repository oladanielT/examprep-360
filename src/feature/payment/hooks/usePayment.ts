import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { PAYMENT_ENDPOINTS, TRIAL_ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/stores/authStore";
import { isProfessionalExam } from "@/lib/exam-category";
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
  ValidatePromoResponse,
  CheckTrialResponse,
  ActivateTrialResponse,
} from "@/api/types";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

// ==================== QUERIES ====================

export interface PaymentPlanQuery {
  schoolType: string;
  examType?: string;
  examTypeId?: string;
  departmentId?: string;
  subscriptionType?: "INDIVIDUAL" | "BODY";
}

export const getPaymentPlanParams = ({
  schoolType,
  examType,
  examTypeId,
  departmentId,
  subscriptionType = "INDIVIDUAL",
}: PaymentPlanQuery) => {
  if (isProfessionalExam(schoolType)) {
    return { examTypeId };
  }

  return {
    schoolType,
    examType,
    subscriptionType,
    ...(departmentId ? { departmentId } : {}),
  };
};

// Fetch payment plans with the identifiers required by each exam category.
export const usePaymentPlans = (options: PaymentPlanQuery) => {
  const params = getPaymentPlanParams(options);
  const enabled = isProfessionalExam(options.schoolType)
    ? Boolean(options.examTypeId)
    : Boolean(options.schoolType && options.examType);

  return useQuery<PaymentPlan[]>({
    queryKey: ["paymentPlans", params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaymentPlan[]>(
        PAYMENT_ENDPOINTS.PLANS,
        {
          params,
        }
      );
      return data;
    },
    enabled,
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
        queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
        queryClient.invalidateQueries({ queryKey: ["examPreferences"] }),
        queryClient.invalidateQueries({ queryKey: ["trialAvailability"] }),
        queryClient.invalidateQueries({ queryKey: ["availableExams"] }),
        queryClient.invalidateQueries({
          queryKey: ["examSelection", "professional-hierarchy"],
        }),
      ]);
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
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["examPreferences"] });
    },
  });
};

// Check specific exam type trial availability
export const useCheckTrial = (examTypeId: string) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<CheckTrialResponse>({
    queryKey: ["trialAvailability", examTypeId],
    queryFn: async () => {
      const { data } = await apiClient.get<CheckTrialResponse>(
        TRIAL_ENDPOINTS.CHECK(examTypeId)
      );
      return data;
    },
    enabled: isAuthenticated && !!examTypeId,
  });
};

// Activate specific exam type trial
export const useActivateTrial = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ActivateTrialResponse,
    AxiosError<ApiError>,
    string
  >({
    mutationFn: async (examTypeId) => {
      const { data } = await apiClient.post<ActivateTrialResponse>(
        TRIAL_ENDPOINTS.ACTIVATE(examTypeId)
      );
      return data;
    },
    onSuccess: (_, examTypeId) => {
      queryClient.invalidateQueries({ queryKey: ["trialAvailability", examTypeId] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

// Validate promo code
export const useValidatePromo = (code: string, planId?: string, examTypeId?: string) => {
  return useQuery<ValidatePromoResponse>({
    queryKey: ["validatePromo", code, planId, examTypeId],
    queryFn: async () => {
      // If we have an examTypeId, we use the new access grants validation endpoint
      if (examTypeId) {
        const { data } = await apiClient.get<ValidatePromoResponse>(
          PAYMENT_ENDPOINTS.VALIDATE_ACCESS_GRANT,
          { params: { code, examTypeId } }
        );
        return data;
      }
      // Fallback for legacy generic promos
      const { data } = await apiClient.get<ValidatePromoResponse>(
        PAYMENT_ENDPOINTS.VALIDATE_PROMO,
        { params: { code, planId } }
      );
      return data;
    },
    enabled: !!code && code.length >= 3 && (!!planId || !!examTypeId),
    retry: false, // Don't retry on 404s for invalid codes
  });
};

// Redeem access grant promo
export const useRedeemPromo = () => {
  const queryClient = useQueryClient();

  return useMutation<
    import("@/api/types").RedeemPromoResponse,
    AxiosError<ApiError>,
    import("@/api/types").RedeemPromoRequest
  >({
    mutationFn: async (request) => {
      const { data } = await apiClient.post<import("@/api/types").RedeemPromoResponse>(
        PAYMENT_ENDPOINTS.REDEEM_ACCESS_GRANT,
        request
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Invalidate trial availability as well if needed
      queryClient.invalidateQueries({ queryKey: ["trialAvailability"] });
    },
  });
};

// Assign institutional code to a student email
export const useAssignCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ codeId, email }: { codeId: string; email: string }) => {
      const { data } = await apiClient.patch(
        PAYMENT_ENDPOINTS.ASSIGN_CODE(codeId),
        { email }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutionalCodes"] });
    },
  });
};
