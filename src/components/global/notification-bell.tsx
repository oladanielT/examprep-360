import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Trophy,
  Flame,
  Snowflake,
  ClipboardList,
  Megaphone,
  CheckCheck,
  Loader2,
  BellOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/feature/notifications/hooks";
import type { Notification, NotificationType } from "@/api/types";

const typeIcons: Record<NotificationType, React.ReactNode> = {
  ACHIEVEMENT: <Trophy className="h-4 w-4 text-yellow-500" />,
  STREAK_REMINDER: <Flame className="h-4 w-4 text-orange-500" />,
  STREAK_LOST: <Flame className="h-4 w-4 text-red-500" />,
  STREAK_FROZEN: <Snowflake className="h-4 w-4 text-blue-500" />,
  TASK_ASSIGNED: <ClipboardList className="h-4 w-4 text-purple-500" />,
  PROMOTION: <Megaphone className="h-4 w-4 text-green-500" />,
};

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

export default function NotificationBell({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data, isLoading } = useNotifications(1, 10);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => n.readAt === null).length;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.readAt) {
      markRead.mutate(notification.id);
    }
    setOpen(false);

    // Navigate based on type
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

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn("relative cursor-pointer", className)}
        aria-label="Notifications"
      >
        <Bell className={cn("h-6 w-6", className?.includes("w-5") && "h-5 w-5")} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-4 right-4 top-[72px] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 z-50 sm:w-96 rounded-xl border bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
                className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <BellOff className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                    !notification.readAt && "bg-primary/5"
                  )}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    {typeIcons[notification.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm",
                        !notification.readAt ? "font-semibold" : "font-medium text-gray-700"
                      )}
                    >
                      {notification.title}
                    </p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                      {getTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.readAt && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-medium text-primary hover:underline"
            >
              See all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
