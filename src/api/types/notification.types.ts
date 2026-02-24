export type NotificationType =
  | "ACHIEVEMENT"
  | "STREAK_REMINDER"
  | "STREAK_LOST"
  | "STREAK_FROZEN"
  | "TASK_ASSIGNED"
  | "PROMOTION";

export interface Notification {
  id: string;
  studentId: string;
  title: string;
  message: string;
  type: NotificationType;
  data: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
