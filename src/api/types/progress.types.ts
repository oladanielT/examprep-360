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
  rank: number;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  score: number;
  examType?: string;
  subjectId?: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  totalParticipants: number;
  userRank?: LeaderboardEntry;
}

export interface LeaderboardParams {
  period?: "weekly" | "monthly" | "allTime";
  examType?: string;
  subjectId?: string;
  limit?: number;
  offset?: number;
}
