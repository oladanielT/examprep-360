import { isProfessionalExam } from "@/lib/exam-category";
import { useRef } from "react";
import { useCheckTrial } from "@/feature/payment/hooks/usePayment";
import { useTrialAttempts, useStartTrialAttempt } from "@/feature/exams/hooks/useExams";
import { useExamPreferences } from "@/feature/exams/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useProfile } from "@/feature/profile/hooks/useProfile";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, PlayCircle, RotateCcw, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useSubscriptions } from "@/feature/subscription/hooks/useSubscription";
import { findActivePaidSubscription } from "@/lib/subscription-access";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrialDashboard() {
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const { data: profileUser } = useProfile();
  const user = profileUser || authUser;
  const { data: preferences } = useExamPreferences();
  const {
    data: subscriptions,
    isPending: subscriptionsPending,
    isError: subscriptionsError,
  } = useSubscriptions();

  const examTypeId = isProfessionalExam(preferences?.examCategory)
    ? preferences?.examTypeId || (user as any)?.examTypeId || ""
    : "";

  const { data: trialInfo, isLoading: loadingTrial } = useCheckTrial(examTypeId);
  const activePaidSubscription = findActivePaidSubscription(
    subscriptions,
    examTypeId,
  );
  const entitlementId = trialInfo?.entitlementId;

  const { data: attempts, isLoading: loadingAttempts, isError: attemptsError, refetch: refetchAttempts } = useTrialAttempts(entitlementId || "");
  const startAttemptMutation = useStartTrialAttempt();
  const startingRef = useRef(false);

  if (
    loadingTrial ||
    subscriptionsPending ||
    subscriptionsError ||
    activePaidSubscription
  ) {
    if (loadingTrial || subscriptionsPending) {
      return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-36 rounded-xl shrink-0" />
          </div>
          <div className="p-0 divide-y divide-gray-100">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 gap-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  }

  // Only show dashboard if they have an active or expired trial
  if (!trialInfo || (trialInfo.status !== "ACTIVE" && trialInfo.status !== "EXPIRED")) {
    return null;
  }

  const isActive = trialInfo.status === "ACTIVE" &&
    (!trialInfo.expiresAt || Date.parse(trialInfo.expiresAt) > Date.now());
  const activeAttempt = attempts?.find((attempt) => attempt.status === "IN_PROGRESS");
  const cannotStart = loadingAttempts || attemptsError || !entitlementId ||
    !!activeAttempt || startAttemptMutation.isPending;

  const handleStartAttempt = async () => {
    if (!entitlementId || !isActive || cannotStart || startingRef.current) return;
    startingRef.current = true;
    try {
      const response = await startAttemptMutation.mutateAsync(entitlementId);
      toast.success("Trial attempt started!");
      if (response && response.id) {
        navigate({
          to: "/exam/$attemptId",
          params: { attemptId: response.id },
          search: { isTrial: true, entitlementId }
        });
      }
    } catch (error: any) {
      const status = error?.response?.status;
      toast.error(status === 409
        ? "An attempt could not be started. Refreshing your attempt history."
        : status === 410
          ? "Trial access has expired. Refreshing your trial status."
          : "Could not start your trial attempt. Please try again.");
    } finally {
      startingRef.current = false;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Free Trial Practice
            {!isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Expired</span>}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Every attempt here draws from your allocated {trialInfo.allocatedQuestionCount ?? 0} trial questions. Re-attempts use the same questions.
          </p>
        </div>
        
        {isActive && activeAttempt ? (
          <Link to="/exam/$attemptId" params={{ attemptId: activeAttempt.id }}
            search={{ isTrial: true, entitlementId }}
            className="shrink-0 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white">
            Continue Attempt
          </Link>
        ) : isActive ? (
          <button
            onClick={handleStartAttempt}
            disabled={cannotStart}
            className="shrink-0 flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {startAttemptMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            {attempts?.length ? "Start New Attempt" : "Start First Attempt"}
          </button>
        ) : (
          <Link
            to="/subscription"
            className="shrink-0 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            Upgrade to Continue
          </Link>
        )}
      </div>

      <div className="p-0">
        {loadingAttempts ? (
          <div className="divide-y divide-gray-100">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 gap-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        ) : attemptsError ? (
          <div className="p-8 text-center text-sm">
            <p>Could not load trial attempts.</p>
            <button onClick={() => void refetchAttempts()} className="mt-2 text-accent">Retry</button>
          </div>
        ) : !attempts || attempts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            You haven't started any trial attempts yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {attempts.map((attempt: any) => {
              const attemptNumber = attempt.attemptNumber;
              const isCompleted = attempt.status === "COMPLETED";
              const inProgress = attempt.status === "IN_PROGRESS";
              const score = attempt.totalScore;
              const percentage = attempt.percentage ?? 0;

              return (
                <div key={attempt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">Attempt #{attemptNumber}</h4>
                        <span className="text-xs text-gray-500">{attempt.status.replaceAll("_", " ")}</span>
                        {isCompleted && attempt.passed && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                        <span>{new Date(attempt.startedAt).toLocaleDateString()}</span>
                        {isCompleted && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span className="font-medium text-gray-700">{score != null ? `${score} points · ` : ""}{percentage}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {inProgress ? (
                      <Link
                        to="/exam/$attemptId"
                        params={{ attemptId: attempt.id }}
                        search={{ isTrial: true, entitlementId }}
                        className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        Continue
                      </Link>
                    ) : isCompleted ? (
                      <>
                        <Link
                          to="/exam/review/$attemptId"
                          params={{ attemptId: attempt.id }}
                          search={{ isTrial: true, entitlementId }}
                          className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
                        >
                          Review
                        </Link>
                        {isActive && !activeAttempt && (
                          <button
                            onClick={handleStartAttempt}
                            disabled={cannotStart}
                            className="px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Try Again
                          </button>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
