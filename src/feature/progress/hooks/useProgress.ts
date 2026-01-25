import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { PROGRESS_ENDPOINTS, GAMIFICATION_ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/stores/authStore";
import type {
  ProgressOverview,
  Streaks,
  TrendData,
  WeakArea,
  ProgressStatistics,
  SubjectProgressMap,
  Achievement,
  LeaderboardResponse,
  LeaderboardParams,
  MyRankResponse,
} from "@/api/types";

// ==================== PROGRESS QUERIES ====================

export const useProgressOverview = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<ProgressOverview>({
    queryKey: ["progress", "overview"],
    queryFn: async () => {
      const { data } = await apiClient.get<ProgressOverview>(
        PROGRESS_ENDPOINTS.OVERVIEW
      );
      return data;
    },
    enabled: isAuthenticated,
  });
};

export const useStreaks = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<Streaks>({
    queryKey: ["progress", "streaks"],
    queryFn: async () => {
      const { data } = await apiClient.get<Streaks>(PROGRESS_ENDPOINTS.STREAKS);
      return data;
    },
    enabled: isAuthenticated,
  });
};

export const useTrends = (days: number = 7) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<TrendData[]>({
    queryKey: ["progress", "trends", days],
    queryFn: async () => {
      const { data } = await apiClient.get<TrendData[]>(PROGRESS_ENDPOINTS.TRENDS, {
        params: { days },
      });
      return data;
    },
    enabled: isAuthenticated,
  });
};

export const useWeakAreas = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<WeakArea[]>({
    queryKey: ["progress", "weakAreas"],
    queryFn: async () => {
      const { data } = await apiClient.get<WeakArea[]>(PROGRESS_ENDPOINTS.WEAK_AREAS);
      return data;
    },
    enabled: isAuthenticated,
  });
};

export const useStatistics = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<ProgressStatistics>({
    queryKey: ["progress", "statistics"],
    queryFn: async () => {
      const { data } = await apiClient.get<ProgressStatistics>(
        PROGRESS_ENDPOINTS.STATISTICS
      );
      return data;
    },
    enabled: isAuthenticated,
  });
};

export const useProgressBySubject = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<SubjectProgressMap>({
    queryKey: ["progress", "bySubject"],
    queryFn: async () => {
      const { data } = await apiClient.get<SubjectProgressMap>(
        PROGRESS_ENDPOINTS.BY_SUBJECT
      );
      return data;
    },
    enabled: isAuthenticated,
  });
};

// ==================== GAMIFICATION QUERIES ====================

export const useAchievements = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<Achievement[]>({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data } = await apiClient.get<Achievement[]>(
        GAMIFICATION_ENDPOINTS.ACHIEVEMENTS
      );
      return data;
    },
    enabled: isAuthenticated,
  });
};

export const useLeaderboard = (params: LeaderboardParams = {}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<LeaderboardResponse>({
    queryKey: ["leaderboard", params],
    queryFn: async () => {
      const { data } = await apiClient.get<LeaderboardResponse>(
        GAMIFICATION_ENDPOINTS.LEADERBOARD,
        { params }
      );
      return data;
    },
    enabled: isAuthenticated,
  });
};

export const useMyRank = (params: Omit<LeaderboardParams, "limit" | "offset"> = {}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<MyRankResponse>({
    queryKey: ["leaderboard", "myRank", params],
    queryFn: async () => {
      const { data } = await apiClient.get<MyRankResponse>(GAMIFICATION_ENDPOINTS.MY_RANK, {
        params,
      });
      return data;
    },
    enabled: isAuthenticated,
  });
};
