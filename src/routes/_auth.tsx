import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";

function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-start justify-center">
          <div className="w-full max-w-2xl font-sans">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/auth/faq-image.png"
          alt="Image"
          width={5000}
          height={5000}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = useAuthStore.getState();
    // Allow access to these paths even when authenticated
    // (user might need to complete registration or payment)
    const allowedPaths = ["/verify-email", "/select-exam", "/summary", "/checkout", "/payment-verify", "/auth/callback"];
    if (isAuthenticated && !allowedPaths.includes(location.pathname)) {
      throw redirect({ to: "/" });
    }
  },
  component: AuthLayout,
});
