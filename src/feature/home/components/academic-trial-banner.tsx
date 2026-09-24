import { Loader2, Sparkles, Clock, ShieldAlert, Star, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useSubscriptions } from "@/feature/subscription/hooks/useSubscription";
import { useStartTrial, usePaymentPlans } from "@/feature/payment/hooks";
import { useExamPreferences } from "@/feature/exams/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useProfile } from "@/feature/profile/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";

export default function AcademicTrialBanner() {
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const { data: profileUser } = useProfile();
  const user = profileUser || authUser;

  const { data: subscriptions, isLoading: loadingSubs } = useSubscriptions();
  const { data: preferences } = useExamPreferences();
  const startTrialMutation = useStartTrial();

  const examCategory = preferences?.examCategory || user?.examCategory || "";
  const examType = preferences?.examTypeRecord?.name || user?.examType || "";

  const { data: plans, isLoading: loadingPlans } = usePaymentPlans({
    schoolType: examCategory,
    examType,
    subscriptionType: "INDIVIDUAL",
  });

  if (loadingSubs) {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-xl shrink-0" />
      </div>
    );
  }

  const activePremium = subscriptions?.find(
    (s) => s.examTypeId === preferences?.examTypeId && s.status === "ACTIVE" && s.paymentMethod !== "TRIAL"
  );
  const trialSubscription = subscriptions?.find(
    (s) => s.examTypeId === preferences?.examTypeId && s.paymentMethod === "TRIAL"
  );
  const activeTrial = trialSubscription?.status === "ACTIVE" ? trialSubscription : undefined;
  const hasUsedTrial = trialSubscription
    ? trialSubscription.status !== "ACTIVE"
    : !!user?.trialUsedAt;

  // Fully subscribed -> show the green active subscription banner
  if (activePremium) {
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
            className="shrink-0 sm:ml-auto px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-full transition-colors shadow-sm"
          >
            Go to Tests
          </button>
        </div>
      </div>
    );
  }

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
        subscriptionId: trialPlan.id,
      });

      if (
        response &&
        ((response as any).success ||
          (response as any).trialEndDate ||
          (response as any).id)
      ) {
        toast.success("Free trial started!", {
          description: "You now have access to practice features.",
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

  // State: Active Free Trial
  if (activeTrial) {
    const daysLeft = activeTrial.endDate
      ? Math.max(0, Math.ceil((new Date(activeTrial.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 7;

    return (
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Trial Status */}
        <div className="overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/5 to-amber-50 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-[#101828]">Free Trial Active</h3>
                <p className="text-sm text-accent font-medium">Expires in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              You can practice up to 10 questions per subject for the configured exam year.
            </p>
          </div>
          <button
            onClick={() => navigate({ to: "/tests/exams" })}
            className="w-full px-4 py-2.5 bg-white border border-accent text-accent text-sm font-semibold rounded-xl hover:bg-accent hover:text-white transition-colors"
          >
            Continue Practice
          </button>
        </div>

        {/* Card 2: Upsell */}
        <div className="overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-[#101828]">Unlock Unlimited Practice</h3>
                <p className="text-sm text-gray-500">Upgrade for full access</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-2 mb-5 ml-1">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Access 4,000+ practice questions</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Take up to 10 full mock exams</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Get detailed results and feedback</li>
            </ul>
          </div>
          <button
            onClick={() => navigate({ to: "/subscription" })}
            className="w-full px-4 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
          >
            Subscribe Now
          </button>
        </div>
      </div>
    );
  }

  // State: Expired Trial
  if (hasUsedTrial) {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[#101828] text-sm sm:text-base">
                Your free trial has expired
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Subscribe today to regain access to practice questions and mock exams.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate({ to: "/subscription" })}
            className="shrink-0 sm:ml-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-full transition-colors shadow-sm"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  // State: Eligible for Free Trial
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
              Start your 7-day free trial — no payment required.
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
