import type { User } from "./auth.types";

// Profile Types
export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  country?: string;
  dateOfBirth?: string;
  academicLevel?: string;
  examType?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ProfileStatistics {
  totalExams: number;
  completedExams: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  studyTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
}

// Re-export User type
export type { User };

// Exam Selection Types (for onboarding flow)
export interface ExamCategoryOption {
  value: string;
  label: string;
}

export interface ExamSubtypeOption {
  id: string;
  name?: string;
  label?: string;
  value?: string;
  slug?: string;
  category?: string;
}

export interface SubjectOption {
  id: string;
  name: string;
  examType: string;
  icon?: string;
}

export interface SaveExamSelectionRequest {
  examCategory: string;
  examSubtype?: string;
  selectedSubjects: string[];
}

// Referral Types
export type ReferralStatus = "PENDING" | "COMPLETED" | "EXPIRED" | string;
export type RewardType = "WALLET_CREDIT" | "SUBSCRIPTION" | "OTHER" | string;

export interface ReferralReferral {
  id: string;
  referredStudent: string;
  referredEmail: string;
  status: ReferralStatus;
  rewardGranted: boolean;
  createdAt: string;
  completedAt?: string | null;
}

export interface ReferralReward {
  id: string;
  rewardType: RewardType;
  rewardValue: { amount: number } | Record<string, unknown>;
  claimed: boolean;
  claimedAt?: string | null;
  expiresAt?: string | null;
}

// GET /user/referral/my-code — returns just the share code + link.
export interface ReferralData {
  code: string;
  shareUrl: string;
}

// GET /user/referral/stats — counters + referrals/rewards lists.
export interface ReferralStats {
  code: string;
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
  unclaimedRewards: number;
  rewardAmount: number;
  referrals: ReferralReferral[];
  rewards: ReferralReward[];
}
