import { Sparkles, CheckCircle2, Crown } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useSubscriptions } from "@/feature/subscription/hooks/useSubscription";

export default function FreeTrialBanner() {
  const navigate = useNavigate();

  const { data: subscriptions, isLoading: loadingSubs } = useSubscriptions();

  // Don't render while subscriptions are loading
  if (loadingSubs) return null;

  const hasActive = subscriptions?.some((s) => s.status === "ACTIVE");

  // Active subscription — show "subscription active" state
  if (hasActive) {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[#101828] text-sm sm:text-base">
                Your subscription is active
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                You have full access to all features. Start practicing now!
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate({ to: "/tests/exams" })}
            className="shrink-0 sm:ml-auto px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-full transition-colors"
          >
            Go to Tests
          </button>
        </div>
      </div>
    );
  }

  // No active subscription — prompt the user to subscribe (paid access only)
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/5 via-orange-50 to-amber-50 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-[#101828] text-sm sm:text-base">
              Unlock full access
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              Subscribe to a plan to start practicing on the platform.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate({ to: "/subscription/add" })}
          className="shrink-0 sm:ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-semibold rounded-full transition-colors"
        >
          <Crown className="w-4 h-4" />
          Subscribe Now
        </button>
      </div>
    </div>
  );
}
