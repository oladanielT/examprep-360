import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { PROFILE_ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/stores/authStore";
import type { User, ProfileStatistics, UpdateProfileRequest, ChangePasswordRequest } from "@/api/types";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  statusCode?: number;
}

// Query: Fetch current user profile
export const useProfile = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<User>({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await apiClient.get<User>(PROFILE_ENDPOINTS.GET);
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Query: Fetch user statistics
export const useProfileStatistics = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<ProfileStatistics>({
    queryKey: ["profile", "statistics"],
    queryFn: async () => {
      const { data } = await apiClient.get<ProfileStatistics>(
        PROFILE_ENDPOINTS.STATISTICS
      );
      return data;
    },
    enabled: isAuthenticated,
  });
};

// Mutation: Update profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation<User, AxiosError<ApiError>, UpdateProfileRequest>({
    mutationFn: async (updates) => {
      const { data } = await apiClient.patch<User>(PROFILE_ENDPOINTS.UPDATE, updates);
      return data;
    },
    onSuccess: (data) => {
      updateUser(data);
      queryClient.setQueryData(["profile"], data);
    },
  });
};

// Mutation: Change password
export const useChangePassword = () => {
  return useMutation<{ message: string }, AxiosError<ApiError>, ChangePasswordRequest>({
    mutationFn: async (passwords) => {
      const { data } = await apiClient.patch(PROFILE_ENDPOINTS.CHANGE_PASSWORD, passwords);
      return data;
    },
  });
};

// Mutation: Upload avatar
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation<{ avatarUrl: string }, AxiosError<ApiError>, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await apiClient.post("/user/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (data) => {
      updateUser({ avatarUrl: data.avatarUrl });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
