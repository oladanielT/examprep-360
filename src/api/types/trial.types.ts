export interface CheckTrialResponse {
  available: boolean;
  status: "ACTIVE" | "EXPIRED" | "NONE";
  examTypeId: string;
  entitlementId?: string;
  startedAt?: string;
  expiresAt?: string;
  remainingSeconds?: number;
  questionLimit: number;
  allocatedQuestionCount: number;
  isPartial: boolean;
  buckets: Array<{
    key: string;
    subjectId: string;
    name: string;
    count: number;
  }>;
  previousAttempts: any[];
}

export interface ActivateTrialResponse {
  // Can be similar to CheckTrialResponse
  available: boolean;
  status: "ACTIVE" | "EXPIRED" | "NONE";
  examTypeId: string;
  entitlementId: string;
  startedAt: string;
  expiresAt: string;
  remainingSeconds: number;
  questionLimit: number;
  allocatedQuestionCount: number;
}

export interface RedeemPromoRequest {
  code: string;
  idempotencyKey?: string;
}

export interface RedeemPromoResponse {
  promoCode: string;
  subscriptionId: string;
  studentSubscriptionId: string;
  examTypeId: string;
  grantedUntil: string;
  idempotent: boolean;
}
