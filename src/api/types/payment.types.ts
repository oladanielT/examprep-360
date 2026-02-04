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
  schoolType: string;
  examType: string;
  courseCode?: string;
  numberOfDays: number;
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
  success: boolean;
  transactionId: string;
  status: "success" | "failed" | "pending";
  message: string;
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
  code: string;
  status: "ACTIVE" | "USED" | "EXPIRED";
  usedBy?: string;
  usedAt?: string;
  expiresAt: string;
}
