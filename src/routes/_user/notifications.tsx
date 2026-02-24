import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import { Button } from "@/components/ui/button";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/feature/notifications/hooks";
import type { Notification, NotificationType } from "@/api/types";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Trophy,
  Flame,
  Snowflake,
  ClipboardList,
  Megaphone,
  CheckCheck,
  BellOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

const typeIcons: Record<NotificationType, React.ReactNode> = {
  ACHIEVEMENT: <Trophy className="h-5 w-5 text-yellow-500" />,
  STREAK_REMINDER: <Flame className="h-5 w-5 text-orange-500" />,
  STREAK_LOST: <Flame className="h-5 w-5 text-red-500" />,
  STREAK_FROZEN: <Snowflake className="h-5 w-5 text-blue-500" />,
  TASK_ASSIGNED: <ClipboardList className="h-5 w-5 text-purple-500" />,
  PROMOTION: <Megaphone className="h-5 w-5 text-green-500" />,
};

const typeLabels: Record<NotificationType, string> = {
  ACHIEVEMENT: "Achievement",
  STREAK_REMINDER: "Streak Reminder",
  STREAK_LOST: "Streak Lost",
  STREAK_FROZEN: "Streak Frozen",
  TASK_ASSIGNED: "Task Assigned",
  PROMOTION: "Promotion",
};

const filterOptions = [
  { label: "Achievement", value: "ACHIEVEMENT" },
  { label: "Streak Reminder", value: "STREAK_REMINDER" },
  { label: "Streak Lost", value: "STREAK_LOST" },
  { label: "Streak Frozen", value: "STREAK_FROZEN" },
  { label: "Task Assigned", value: "TASK_ASSIGNED" },
  { label: "Promotion", value: "PROMOTION" },
];

function getTimeAgo(dateStr: string) {
  try {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return "";
  }
}

function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const navigate = useNavigate();

  const { data, isLoading } = useNotifications(
    page,
    15,
    typeFilter ? (typeFilter as NotificationType) : undefined
  );
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.data ?? [];
  const meta = data?.meta;
  const hasUnread = notifications.some((n) => n.readAt === null);

  const handleClick = (notification: Notification) => {
    if (!notification.readAt) {
      markRead.mutate(notification.id);
    }

    switch (notification.type) {
      case "ACHIEVEMENT":
        navigate({ to: "/activities" });
        break;
      case "STREAK_REMINDER":
      case "STREAK_LOST":
      case "STREAK_FROZEN":
        navigate({ to: "/" });
        break;
      case "TASK_ASSIGNED":
        navigate({ to: "/activities" });
        break;
      case "PROMOTION":
        navigate({ to: "/subscription" });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <CustomPageHeader
        heading="Notifications"
        subHeading="Stay up to date with your activity"
        search={false}
        filter
        filterOptions={filterOptions}
        activeFilter={typeFilter}
        onFilterChange={(val) => {
          setTypeFilter(val);
          setPage(1);
        }}
      />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Mark all read */}
        {hasUnread && (
          <div className="mb-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          </div>
        )}

        {/* Notification list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <BellOff className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg font-medium text-muted-foreground">No notifications</p>
            <p className="text-sm text-muted-foreground/70">
              {typeFilter
                ? "No notifications match this filter."
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleClick(notification)}
                className={cn(
                  "flex w-full items-start gap-4 rounded-lg border bg-white p-4 text-left transition-colors hover:bg-gray-50",
                  !notification.readAt && "border-primary/20 bg-primary/5 hover:bg-primary/10"
                )}
              >
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  {typeIcons[notification.type]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-sm",
                        !notification.readAt ? "font-semibold" : "font-medium text-gray-700"
                      )}
                    >
                      {notification.title}
                    </p>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      {typeLabels[notification.type]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    {getTimeAgo(notification.createdAt)}
                  </p>
                </div>
                {!notification.readAt && (
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.totalPages}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_user/notifications")({
  component: NotificationsPage,
});
