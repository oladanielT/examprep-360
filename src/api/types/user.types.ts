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
  name: string;
  category: string;
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
export interface ReferralCode {
  code: string;
  shareUrl: string;
}

export interface ReferralStats {
  totalReferrals: number;
  successfulConversions: number;
  pendingRewards: number;
  totalEarnings: number;
}

export interface ReferralReward {
  id: string;
  type: string;
  value: number;
  claimed: boolean;
  claimedAt?: string;
}
