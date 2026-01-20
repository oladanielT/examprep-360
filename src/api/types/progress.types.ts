// Progress Types
export interface ProgressOverview {
  totalStudyTime: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  examsCompleted: number;
  averageScore: number;
  subjectsStudied: number;
  topicsCompleted: number;
}

export interface Streaks {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  streakHistory: StreakDay[];
}

export interface StreakDay {
  date: string;
  active: boolean;
  studyMinutes: number;
}

export interface TrendData {
  date: string;
  questionsAnswered: number;
  correctAnswers: number;
  studyMinutes: number;
  score?: number;
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
