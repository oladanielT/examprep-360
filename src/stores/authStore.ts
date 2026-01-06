import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/api/types";

interface AuthState {
  // State
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  reset: () => void;
}

const initialState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      setUser: (user) => set({ user }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () => set(initialState),

      reset: () => set(initialState),
    }),
    {
      name: "exprep-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
