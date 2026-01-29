import { createFileRoute, Outlet } from "@tanstack/react-router";

function SubscriptionLayout() {
  return <Outlet />;
}

export const Route = createFileRoute("/_user/subscription")({
  component: SubscriptionLayout,
});
