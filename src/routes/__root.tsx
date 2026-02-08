import {
  createRootRoute,
  Outlet,
  useNavigate,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { lazy } from "react";
import { Logo } from "@/components/global/logo";

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-router-devtools").then((mod) => ({
        default: mod.TanStackRouterDevtools,
      }))
    )
  : () => null;
import PrimaryButton from "@/components/buttons/primary-button";
import { Home, ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";

const RootLayout = () => (
  <>
    <Outlet />
    <TanStackRouterDevtools />
  </>
);

function NotFoundComponent() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="flex flex-col gap-8 items-center text-center">
        <Logo />

        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-[150px] font-bold text-accent/10 leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-accent/10 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter text-[#101828]">
            Page Not Found
          </h1>
          <p className="text-lg text-[#667085] max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been
            moved or deleted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <PrimaryButton
            onClick={() => navigate({ to: "/" })}
            className="bg-accent hover:bg-accent/80 text-white text-lg px-8"
            title="Go to Dashboard"
          >
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              <span>Go to Dashboard</span>
            </div>
          </PrimaryButton>

          <PrimaryButton
            onClick={() => window.history.back()}
            className="bg-transparent hover:bg-gray-100 text-gray-800 border border-gray-300 text-lg px-8"
            title="Go Back"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </div>
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <section className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="flex flex-col gap-8 items-center text-center">
        <Logo />

        {/* Error Illustration */}
        <div className="relative">
          <div className="text-[150px] font-bold text-red-500/10 leading-none">
            !
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter text-[#101828]">
            Something Went Wrong
          </h1>
          <p className="text-lg text-[#667085] max-w-md mx-auto">
            An unexpected error occurred. You can try again or go back to the
            dashboard.
          </p>
        </div>

        {/* Error details (dev only) */}
        {import.meta.env.DEV && error instanceof Error && (
          <pre className="max-h-32 w-full max-w-md overflow-auto rounded-lg bg-red-50 p-4 text-left text-sm text-red-700">
            {error.message}
          </pre>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <PrimaryButton
            onClick={() => {
              reset();
              router.invalidate();
            }}
            className="bg-accent hover:bg-accent/80 text-white text-lg px-8"
            title="Try Again"
          >
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </div>
          </PrimaryButton>

          <PrimaryButton
            onClick={() => window.location.assign("/")}
            className="bg-transparent hover:bg-gray-100 text-gray-800 border border-gray-300 text-lg px-8"
            title="Go to Dashboard"
          >
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              <span>Go to Dashboard</span>
            </div>
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
