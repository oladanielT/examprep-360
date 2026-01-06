import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface UIState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Modal management
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Loading states (for global loading indicators)
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Toast/notification queue (if not using external library)
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Theme
      theme: "system",
      setTheme: (theme) => set({ theme }),

      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Modal
      activeModal: null,
      modalData: null,
      openModal: (modalId, data = {}) => set({ activeModal: modalId, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),

      // Loading
      globalLoading: false,
      setGlobalLoading: (globalLoading) => set({ globalLoading }),

      // Notifications
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: crypto.randomUUID() },
          ],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: "exprep-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// Selector hooks
export const useTheme = () => useUIStore((state) => state.theme);
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen);
export const useActiveModal = () => useUIStore((state) => state.activeModal);
export const useNotifications = () => useUIStore((state) => state.notifications);
