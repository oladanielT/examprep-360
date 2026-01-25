// Progress Types
export interface ProgressOverview {
  xp: number;
  weeklyXP: number;
  currentStreak: number;
  longestStreak: number;
  weeklyRank: number;
  xpToNextRank: number;
  totalExams: number;
  totalQuestions: number;
  totalCorrect: number;
  averageScore: number;
  totalTimeSpent: number;
  activeGoals: Goal[];
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  type: string;
}

export interface Streaks {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  streakFreezeCount: number;
}

export interface TrendData {
  date: string;
  averageScore: number;
  xpEarned: number;
  examsCompleted: number;
}

export interface WeakArea {
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicName?: string;
  accuracy: number;
  questionsAttempted: number;
  suggestedFocus: boolean;
}

export interface ProgressStatistics {
  xp: number;
  weeklyXP: number;
  currentStreak: number;
  longestStreak: number;
  weeklyRank: number;
  xpToNextRank: number;
  totalExams: number;
  totalQuestions: number;
  totalCorrect: number;
  averageScore: number;
  totalTimeSpent: number;
  activeGoals: Goal[];
}

export interface SubjectProgressItem {
  correct: number;
  total: number;
}

export type SubjectProgressMap = Record<string, SubjectProgressItem>;

// Gamification Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export interface LeaderboardEntry {
  id: string;
  fullName: string;
  profilePictureUrl?: string;
  xp: number;
  weeklyXP: number;
  monthlyXP: number;
  currentStreak: number;
}

export interface MyRankResponse {
  rank: number;
  xp: number;
  xpToNextRank: number;
}

export type LeaderboardResponse = LeaderboardEntry[];

export interface LeaderboardParams {
  period?: "weekly" | "monthly" | "allTime";
  examType?: string;
  subjectId?: string;
  limit?: number;
  offset?: number;
}
