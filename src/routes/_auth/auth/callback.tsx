import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Logo } from "@/components/global/logo";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/api/client";
import { PROFILE_ENDPOINTS } from "@/api/endpoints";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import PrimaryButton from "@/components/buttons/primary-button";
import type { User } from "@/api/types";

type OAuthSearchParams = {
  accessToken?: string;
  refreshToken?: string;
  user?: string;
  error?: string;
};

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_auth/auth/callback" });
  const { setTokens, setUser } = useAuthStore();

  const [status, setStatus] = useState<"processing" | "success" | "error">(
    () => {
      if (search.error || (!search.accessToken && !search.refreshToken)) {
        return "error";
      }
      return "processing";
    }
  );
  const [errorMessage, setErrorMessage] = useState(
    search.error || "Authentication failed. Please try again."
  );

  useEffect(() => {
    if (status !== "processing") return;

    const processAuth = async () => {
      try {
        if (!search.accessToken || !search.refreshToken) {
          setErrorMessage("Missing authentication tokens.");
          setStatus("error");
          return;
        }

        // Store tokens
        setTokens(search.accessToken, search.refreshToken);

        // Parse and store user data if provided in URL
        if (search.user) {
          try {
            const userData = JSON.parse(decodeURIComponent(search.user));
            setUser(userData);
          } catch {
            // Will fall through to profile fetch below
          }
        }

        // Fetch user profile if not already set (backend may not send user in URL)
        if (!useAuthStore.getState().user) {
          try {
            const { data } = await apiClient.get<User>(PROFILE_ENDPOINTS.GET);
            setUser(data);
          } catch {
            // Profile fetch failed, but tokens are stored - continue
          }
        }

        setStatus("success");
      } catch {
        setErrorMessage("Something went wrong during authentication.");
        setStatus("error");
      }
    };

    processAuth();
  }, [status, search, setTokens, setUser]);

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        // Check if user needs to complete onboarding
        const user = useAuthStore.getState().user;
        const needsCategory = !user?.examCategory;
        const needsExamSelection = !user?.examType || !user?.selectedSubjects?.length;

        if (needsCategory) {
          // New Google user: needs to pick exam category first
          navigate({ to: "/welcome" });
        } else if (needsExamSelection) {
          navigate({ to: "/select-exam" });
        } else {
          navigate({ to: "/" });
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  return (
    <section className="space-y-6">
      <Logo />

      <div className="flex flex-col items-center justify-center py-10 space-y-6">
        {status === "processing" && (
          <>
            <Loader2 className="h-16 w-16 text-accent animate-spin" />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-[#101828]">
                Signing you in...
              </h2>
              <p className="text-[#667085]">
                Please wait while we complete your authentication.
              </p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-[#101828]">
                Sign In Successful!
              </h2>
              <p className="text-[#667085]">
                Redirecting you to your dashboard...
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="bg-red-100 rounded-full p-4">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-[#101828]">
                Authentication Failed
              </h2>
              <p className="text-[#667085]">{errorMessage}</p>
            </div>
            <PrimaryButton
              onClick={() => navigate({ to: "/sign-in" })}
              className="w-full max-w-md bg-accent hover:bg-accent/80 text-white"
              title="Back to Sign In"
            />
          </>
        )}
      </div>
    </section>
  );
}

export const Route = createFileRoute("/_auth/auth/callback")({
  validateSearch: (search: Record<string, unknown>): OAuthSearchParams => {
    return {
      accessToken: search.accessToken as string | undefined,
      refreshToken: search.refreshToken as string | undefined,
      user: search.user as string | undefined,
      error: search.error as string | undefined,
    };
  },
  component: OAuthCallbackPage,
});
