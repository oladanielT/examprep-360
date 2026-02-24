import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Nav from "@/components/global/nav";
import { useAuthStore } from "@/stores/authStore";
import { usePushNotifications } from "@/feature/notifications/hooks/usePushNotifications";

function UserLayout() {
  usePushNotifications();

  return (
    <div className="bg-white min-h-screen font-sans">
      <Nav />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_user")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: "/sign-in" });
    }
  },
  component: UserLayout,
});
