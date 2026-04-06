import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useSubscriptions } from "@/feature/subscription/hooks/useSubscription";
import { useStartTrial, usePaymentPlans } from "@/feature/payment/hooks";
import { useExamPreferences } from "@/feature/exams/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useProfile } from "@/feature/profile/hooks/useProfile";

export default function FreeTrialBanner() {
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const { data: profileUser } = useProfile();
  const user = profileUser || authUser;

  const { data: subscriptions, isLoading: loadingSubs } = useSubscriptions();
  const { data: preferences } = useExamPreferences();
  const startTrialMutation = useStartTrial();

  // Use exam preferences (reliable for logged-in users) to fetch the right plans
  const examCategory = preferences?.examCategory || user?.examCategory || "";
  const examType = preferences?.examTypeRecord?.name || user?.examType || "";

  const { data: plans, isLoading: loadingPlans } = usePaymentPlans(
    examCategory,
    examType,
    "INDIVIDUAL"
  );

  // Don't render while subscriptions are loading
  if (loadingSubs) return null;

  const hasActive = subscriptions?.some((s) => s.status === "ACTIVE");

  const handleStartTrial = async () => {
    if (!user?.id) {
      toast.error("Please sign in to start a free trial.");
      return;
    }

    const trialPlan = plans?.[0];
    if (!trialPlan) {
      toast.error("Plans are still loading. Please try again in a moment.");
      return;
    }

    try {
      const response = await startTrialMutation.mutateAsync({
        studentId: user.id,
        subscriptionId: trialPlan.id,
      });

      if (
        response &&
        ((response as any).success ||
          (response as any).trialEndDate ||
          (response as any).id)
      ) {
        toast.success("Free trial started!", {
          description: "You now have access to all features.",
        });
        navigate({ to: "/tests/exams" });
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to start free trial. Please try again.";
      toast.error(message);
    }
  };

  // Active subscription/trial — show "trial active" state
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

  // No active subscription — show "start free trial" state
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/5 via-orange-50 to-amber-50 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-[#101828] text-sm sm:text-base">
              Try all features for free
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              Start your free trial — no payment required.
            </p>
          </div>
        </div>

        <button
          onClick={handleStartTrial}
          disabled={startTrialMutation.isPending || loadingPlans}
          className="shrink-0 sm:ml-auto px-5 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-semibold rounded-full transition-colors disabled:opacity-50"
        >
          {startTrialMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Starting...
            </span>
          ) : (
            "Start Free Trial"
          )}
        </button>
      </div>
    </div>
  );
}
