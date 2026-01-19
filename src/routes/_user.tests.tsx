import { createFileRoute, Outlet } from "@tanstack/react-router";

function TestsLayout() {
  return <Outlet />;
}

export const Route = createFileRoute("/_user/tests")({
  component: TestsLayout,
});
