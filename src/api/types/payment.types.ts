// Payment Types

export interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  pricePerStudent: number | null;
  currency: string;
  duration: number; // in days
  features: string[];
  isActive: boolean;
  subscriptionType: "INDIVIDUAL" | "INSTITUTIONAL";
  category: "FIXED" | "FLEXIBLE";
  schoolType: string;
  examType: string;
  examTypeId: string;
  departmentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PricingPreview {
  basePrice: number;
  discount: number;
  finalPrice: number;
  currency: string;
  plan: PaymentPlan;
  numberOfStudents?: number;
}

export interface InitializePaymentRequest {
  studentId: string;
  subscriptionId: string; // This is the plan ID
  amount: number;
  subscriptionType: "INDIVIDUAL" | "BODY";
  numberOfSubjects: number;
  numberOfStudents: number;
  studentEmails?: string[];
  schoolType: string;
  examType: string;
  courseCode?: string;
  numberOfDays: number;
  promoCode?: string;
  useReferralBenefit?: boolean;
  useWallet?: boolean;
  metadata: {
    callbackUrl: string;
  };
}

export interface InitializePaymentResponse {
  transactionId: string;
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface VerifyPaymentRequest {
  reference: string;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  message: string;
  transaction: {
    id: string;
    reference: string;
    status: "SUCCESS" | "FAILED" | "PENDING";
    amount: number;
    currency: string;
    paidAt: string | null;
    failureReason: string | null;
  };
  subscription?: {
    id: string;
    planId: string;
    startDate: string;
    endDate: string;
  };
}

export interface RedeemLicenseRequest {
  code: string;
  studentId: string;
  subjects: string[];
  courses: string[];
}

export interface RedeemLicenseResponse {
  success: boolean;
  message: string;
  subscription?: {
    id: string;
    planId: string;
    startDate: string;
    endDate: string;
  };
}

export interface StartTrialRequest {
  studentId: string;
  subscriptionId: string;
}

export interface StartTrialResponse {
  success: boolean;
  message: string;
  trialEndDate: string;
}

export interface InstitutionalCode {
  id: string;
  code: string;
  authorizedEmail: string | null;
  isActive: boolean;
  redemptionCount: number;
  maxRedemptions: number;
  redeemedBy: string | null;
  redeemedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  subscription: {
    name: string;
    duration: number;
    basePrice: number;
  };
  _count: {
    redemptions: number;
  };
}

export interface CodeRedemption {
  id: string;
  studentId: string;
  subscriptionId: string;
  startDate: string;
  endDate: string;
  status: string;
  student: {
    id: string;
    fullName: string;
    email: string;
    registrationDate: string;
  };
}

export interface ValidatePromoResponse {
  promo: {
    id: string;
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    startDate: string;
    endDate: string;
    maxUsage: number | null;
    usageCount: number;
    perUserLimit: number;
    eligibleProducts: string[];
    isStackable: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
  discountInfo: {
    discountAmount: number;
    finalPrice: number;
  } | null;
  message?: string;
}
