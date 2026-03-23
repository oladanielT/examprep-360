import { Link, useRouterState } from "@tanstack/react-router";

export const Logo = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isOnboarding =
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/select-exam") ||
    pathname.startsWith("/summary") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/payment-verify") ||
    pathname.startsWith("/auth/callback");

  if (isOnboarding) {
    return (
      <a href="https://exampreps360.online" className="flex items-center gap-2 font-medium">
        <img src="/alt-logo.png" alt="Logo" width={204} height={60} />
      </a>
    );
  }

  return (
    <Link to="/" className="flex items-center gap-2 font-medium">
      <img src="/alt-logo.png" alt="Logo" width={204} height={60} />
    </Link>
  );
};
