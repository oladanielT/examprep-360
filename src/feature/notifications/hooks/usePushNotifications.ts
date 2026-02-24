import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  requestNotificationPermission,
  onForegroundMessage,
} from "@/lib/firebase";

export function usePushNotifications() {
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Request permission and register FCM token
    requestNotificationPermission();

    // Listen for foreground messages
    const unsubscribe = onForegroundMessage((payload) => {
      // Invalidate notifications cache so the bell updates
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      // Show toast notification
      const title = payload.notification?.title || "New Notification";
      const body = payload.notification?.body;
      toast(title, { description: body });
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);
}
