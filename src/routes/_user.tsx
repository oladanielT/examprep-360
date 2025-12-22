import { createFileRoute, Outlet } from "@tanstack/react-router";
import Nav from "@/components/global/nav";

function UserLayout() {
  return (
    <div className="bg-white min-h-screen font-sans">
      <Nav />
      <div className="max-w-6xl mx-auto">
        <Outlet />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_user")({
  component: UserLayout,
});
