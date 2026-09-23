import { Loader2, Sparkles, Clock, ShieldAlert, Star, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useSubscriptions } from "@/feature/subscription/hooks/useSubscription";
import { useCheckTrial, useActivateTrial } from "@/feature/payment/hooks/usePayment";
import { useExamPreferences } from "@/feature/exams/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useProfile } from "@/feature/profile/hooks/useProfile";
import { findActivePaidSubscription } from "@/lib/subscription-access";

export default function ProfessionalTrialBanner() {
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const { data: profileUser } = useProfile();
  const user = profileUser || authUser;

  const {
    data: subscriptions,
    isPending: subscriptionsPending,
    isError: subscriptionsError,
  } = useSubscriptions();
  const { data: preferences } = useExamPreferences();
  
  const examTypeId = preferences?.examTypeId || (user as any)?.examTypeId || "";

  const { data: trialInfo, isLoading: loadingTrial } = useCheckTrial(examTypeId);
  const activateTrialMutation = useActivateTrial();

  if (subscriptionsPending || subscriptionsError || loadingTrial) return null;

  const activePremium = findActivePaidSubscription(
    subscriptions,
    preferences?.examTypeId,
  );

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

    if (!examTypeId) {
      toast.error("Exam type not selected. Please set up your preferences first.");
      return;
    }

    try {
      await activateTrialMutation.mutateAsync(examTypeId);
      toast.success("Free trial started!", {
        description: "You now have access to practice features.",
      });
      navigate({ to: "/tests/exams" });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to start free trial. Please try again.";
      toast.error(message);
    }
  };

  // State: Active Free Trial
  if (trialInfo?.status === "ACTIVE") {
    // If the API gives remainingSeconds, use it, else default fallback
    const daysLeft = trialInfo.remainingSeconds 
      ? Math.max(0, Math.ceil(trialInfo.remainingSeconds / (24 * 3600)))
      : 7;

    const allocatedCount = trialInfo.allocatedQuestionCount || trialInfo.questionLimit || 100;

    return (
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Trial Status */}
        <div className="overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/5 to-amber-50 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#101828]">Free Trial Active</h3>
                  <p className="text-sm text-accent font-medium">Expires in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}</p>
                </div>
              </div>
              {trialInfo.isPartial && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm">
                  <ShieldAlert className="w-3 h-3" />
                  Partial Allocation
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-5">
              You can practice up to {allocatedCount} questions per subject/topic for the configured exam year.
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
  if (trialInfo?.status === "EXPIRED") {
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

  // State: Eligible for Free Trial (Not started)
  if (trialInfo?.available) {
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
            disabled={activateTrialMutation.isPending}
            className="shrink-0 sm:ml-auto px-5 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-semibold rounded-full transition-colors disabled:opacity-50"
          >
            {activateTrialMutation.isPending ? (
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

  // State: Unavailable Trial (e.g. not configured by admin)
  return null;
}
