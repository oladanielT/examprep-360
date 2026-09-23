import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Trash2, ArrowRightLeft, Plus, Pencil, Copy, Check, KeyRound, Mail, Crown } from "lucide-react";
import { toast } from "sonner";
import {
  useSubscriptions,
  useDeleteSubscription,
  useSwitchSubscription,
  useChangeSubscriptionSubjects,
} from "./hooks/useSubscription";
import { useAssignCode, useCheckTrial, useInstitutionalCodes, useRedeemLicense } from "@/feature/payment/hooks";
import { useExamPreferences, useExamSubjects, useProfessionalHierarchy } from "@/feature/exams/hooks";
import { useRegistrationStore } from "@/stores/registrationStore";
import type { CheckTrialResponse, InstitutionalCode } from "@/api/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubjectPicker } from "@/components/subject-picker";
import type { UserSubscription } from "@/api/types";
import { SubscriptionTimer } from "./components/subscription-timer";
import { isProfessionalExam } from "@/lib/exam-category";
import { findActivePaidSubscription } from "@/lib/subscription-access";

// Max subjects allowed per exam type (matches registration flow)
function getMaxSubjects(examType: string): number {
  const normalized = examType.toLowerCase();
  // Post-UTME: students pick a single subject. Checked before JAMB/UTME
  // since "Post-UTME" also matches "utme".
  if (normalized.includes("post")) {
    return 1;
  }
  if (normalized.includes("jamb") || normalized.includes("utme")) {
    return 4;
  }
  return 9; // WAEC, NECO, etc.
}

function ProfessionalTrialSubscriptionCard({
  trial,
  examName,
}: {
  trial: CheckTrialResponse;
  examName: string;
}) {
  const active = trial.status === "ACTIVE";

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 sm:p-5 space-y-3">
      {active && trial.expiresAt && (
        <SubscriptionTimer endDate={trial.expiresAt} />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
            {examName}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Full professional curriculum &middot; Trial access
          </p>
        </div>
        <img
          src="/svg/note.svg"
          alt=""
          className="w-10 h-10 sm:w-12 sm:h-12 shrink-0"
        />
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            active
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {trial.status}
        </span>
        <span className="text-xs text-gray-500">Trial access</span>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {active && (
          <Link
            to="/tests/exams"
            className="inline-flex h-8 items-center rounded-full bg-amber-600 px-3 text-xs font-semibold text-white hover:bg-amber-700"
          >
            Continue Practice
          </Link>
        )}
        <Link
          to="/subscription/add"
          className="inline-flex h-8 items-center rounded-full border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-800 hover:bg-amber-100"
        >
          Choose a Plan
        </Link>
      </div>
    </div>
  );
}

export const SubscriptionSection = () => {
  const navigate = useNavigate();
  const { data: subscriptions, isLoading } = useSubscriptions();
  const { data: preferences } = useExamPreferences();
  const isProfessional = isProfessionalExam(preferences?.examCategory);
  const examTypeId = preferences?.examTypeId || "";
  const { data: professionalHierarchy } = useProfessionalHierarchy(isProfessional ? examTypeId : "");
  const { data: professionalTrial, isPending: trialPending } = useCheckTrial(
    isProfessional ? examTypeId : "",
  );
  const activePaidSubscription = findActivePaidSubscription(
    subscriptions,
    examTypeId,
  );
  const displayedSubscriptions = useMemo(() => {
    const academicSubscriptions: UserSubscription[] = [];
    const professionalByExam = new Map<string, UserSubscription>();

    for (const subscription of subscriptions ?? []) {
      if (!isProfessionalExam(subscription.subscription.schoolType)) {
        academicSubscriptions.push(subscription);
        continue;
      }

      const current = professionalByExam.get(subscription.examTypeId);
      const currentEnd = current?.endDate ? Date.parse(current.endDate) : 0;
      const candidateEnd = subscription.endDate
        ? Date.parse(subscription.endDate)
        : 0;
      const replacesInactive =
        current?.status !== "ACTIVE" && subscription.status === "ACTIVE";
      const sameStatusWithLaterEnd =
        current?.status === subscription.status && candidateEnd > currentEnd;
      if (!current || replacesInactive || sameStatusWithLaterEnd) {
        professionalByExam.set(subscription.examTypeId, subscription);
      }
    }

    return [...academicSubscriptions, ...professionalByExam.values()];
  }, [subscriptions]);
  const showProfessionalTrial =
    isProfessional &&
    !activePaidSubscription &&
    (professionalTrial?.status === "ACTIVE" ||
      professionalTrial?.status === "EXPIRED");
  const deleteMutation = useDeleteSubscription();
  const switchMutation = useSwitchSubscription();
  const changeSubjects = useChangeSubscriptionSubjects();

  const [editingSubscription, setEditingSubscription] =
    useState<UserSubscription | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // License codes
  const { data: institutionalCodes } = useInstitutionalCodes();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showRedeemInput, setShowRedeemInput] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const redeemMutation = useRedeemLicense();
  const assignCodeMutation = useAssignCode();
  const [assigningCodeId, setAssigningCodeId] = useState<string | null>(null);
  const [assignEmail, setAssignEmail] = useState("");
  const { data: registrationData } = useRegistrationStore();

  const getCodeStatus = (item: InstitutionalCode) => {
    if (item.redemptionCount >= item.maxRedemptions) return "Redeemed";
    if (!item.isActive) return "Inactive";
    if (item.expiresAt && new Date(item.expiresAt) < new Date()) return "Expired";
    return "Pending";
  };

  const getCodeStatusStyle = (status: string) => {
    switch (status) {
      case "Redeemed":
        return "bg-blue-100 text-blue-700";
      case "Inactive":
        return "bg-gray-100 text-gray-500";
      case "Expired":
        return "bg-red-100 text-red-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleRedeem = () => {
    if (!redeemCode.trim()) {
      toast.error("Please enter a license code");
      return;
    }
    redeemMutation.mutate(
      {
        code: redeemCode.trim(),
        studentId: registrationData.studentId || "",
        subjects: [],
        courses: [],
      },
      {
        onSuccess: () => {
          toast.success("License code redeemed successfully!");
          setRedeemCode("");
          setShowRedeemInput(false);
        },
        onError: (error) => {
          const status = error.response?.status;
          const message = error.response?.data?.message;
          if (status === 403) {
            toast.error(message || "This code is assigned to a different email address.");
          } else if (status === 404) {
            toast.error("Invalid license code. Please check and try again.");
          } else {
            toast.error(message || "Failed to redeem code. Please try again.");
          }
        },
      }
    );
  };

  const { data: availableSubjects, isLoading: isLoadingSubjects } =
    useExamSubjects(editingSubscription?.examType ?? "");

  // The focused subscription matches the current exam preferences
  const isFocused = (sub: { examType: string; examTypeId: string }) =>
    preferences?.examTypeId
      ? sub.examTypeId === preferences.examTypeId
      : sub.examType === preferences?.examSubtype;

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Subscription deleted"),
      onError: (error) =>
        toast.error(
          error.response?.data?.message || "Failed to delete subscription"
        ),
    });
  };

  const handleSwitch = (id: string) => {
    switchMutation.mutate(id, {
      onSuccess: () => toast.success("Switched exam focus"),
      onError: (error) =>
        toast.error(
          error.response?.data?.message || "Failed to switch subscription"
        ),
    });
  };

  const handleEditSubjects = (sub: UserSubscription) => {
    setEditingSubscription(sub);
    setSelectedSubjects(sub.subjects.map((s) => s.id));
  };

  const handleUpgrade = (sub: UserSubscription) => {
    const navigateToUpgrade = () => {
      navigate({
        to: "/subscription/upgrade",
        search: {
          examType: sub.examType,
          examTypeId: sub.examTypeId,
          subjects: sub.subjects.map((s) => s.id).join(","),
          subscriptionId: sub.id,
        },
      });
    };

    // If already focused, go straight to upgrade
    if (isFocused(sub)) {
      navigateToUpgrade();
      return;
    }

    // Switch focus first, then navigate
    switchMutation.mutate(sub.id, {
      onSuccess: () => {
        navigateToUpgrade();
      },
      onError: (error) =>
        toast.error(
          error.response?.data?.message || "Failed to switch subscription"
        ),
    });
  };

  const handleSaveSubjects = () => {
    if (!editingSubscription) return;
    changeSubjects.mutate(
      {
        id: editingSubscription.id,
        request: { subjects: selectedSubjects, courses: [] },
      },
      {
        onSuccess: () => {
          toast.success("Subjects updated successfully");
          setEditingSubscription(null);
        },
        onError: (error) =>
          toast.error(
            error.response?.data?.message || "Failed to update subjects"
          ),
      }
    );
  };

  if (isLoading || (isProfessional && trialPending)) {
    return (
      <section className="py-10 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </section>
    );
  }

  return (
    <section className="py-4 sm:py-6">
      <div className="pb-4 sm:pb-6">
        <Link
          to="/subscription/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-4xl border border-border bg-accent text-white hover:bg-accent/80 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Subscription
        </Link>
      </div>

      {displayedSubscriptions.length === 0 && !showProfessionalTrial ? (
        <p className="text-gray-500 py-6">
          No subscriptions yet. Add one to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {showProfessionalTrial && professionalTrial && (
            <ProfessionalTrialSubscriptionCard
              trial={professionalTrial}
              examName={professionalHierarchy?.name || preferences?.examTypeRecord?.name || "Professional Exam"}
            />
          )}
          {displayedSubscriptions.map((sub) => {
            const professionalSubscription = isProfessionalExam(
              sub.subscription.schoolType,
            );
            const displayName = professionalSubscription
              ? sub.subscription.name
              : sub.examType;

            return (
            <div
              key={sub.id}
              className="relative bg-[#FFFBEB] rounded-xl border border-amber-100 p-4 sm:p-5 space-y-3"
            >
              {sub.status === "ACTIVE" && sub.endDate && (
                <SubscriptionTimer endDate={sub.endDate} />
              )}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {displayName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {professionalSubscription ? (
                      <>
                        Full professional curriculum &middot;{" "}
                        {sub.subscription.duration}-day plan
                      </>
                    ) : (
                      <>
                        {sub.subjects.length} Subject
                        {sub.subjects.length !== 1 ? "s" : ""} &middot;{" "}
                        {sub.subscription.name}
                      </>
                    )}
                  </p>
                </div>
                <img
                  src="/svg/note.svg"
                  alt=""
                  className="w-10 h-10 sm:w-12 sm:h-12 shrink-0"
                />
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    sub.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : sub.status === "EXPIRED"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {sub.status}
                </span>
                <span className="text-xs text-gray-400">
                  {sub.paymentMethod}
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-2 pt-1">
                {isFocused(sub) ? (
                  <span className="text-xs text-accent font-medium px-2 py-1">
                    Current Focus
                  </span>
                ) : sub.status === "ACTIVE" ? (
                  <button
                    onClick={() => handleSwitch(sub.id)}
                    disabled={switchMutation.isPending}
                    className="inline-flex items-center gap-1 h-8 px-3 text-xs font-medium rounded-4xl border border-border bg-input/30 hover:bg-input/50 transition-colors disabled:opacity-50"
                  >
                    <ArrowRightLeft className="h-3 w-3" />
                    Switch
                  </button>
                ) : null}
                {sub.status === "ACTIVE" &&
                  sub.paymentMethod === "TRIAL" && (
                    <button
                      onClick={() => handleUpgrade(sub)}
                      disabled={switchMutation.isPending}
                      className="inline-flex items-center gap-1 h-8 px-3 text-xs font-medium rounded-4xl bg-accent text-white hover:bg-accent/80 transition-colors disabled:opacity-50"
                    >
                      <Crown className="h-3 w-3" />
                      {switchMutation.isPending ? "Switching..." : "Upgrade"}
                    </button>
                  )}
                {sub.status === "ACTIVE" && !professionalSubscription && (
                  <button
                    onClick={() => handleEditSubjects(sub)}
                    className="inline-flex items-center gap-1 h-8 px-3 text-xs font-medium rounded-4xl border border-border bg-input/30 hover:bg-input/50 transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit Subjects
                  </button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center gap-1 h-8 px-3 text-xs font-medium rounded-4xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete your {displayName}{" "}
                        subscription? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(sub.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* License Codes Section (for institutional buyers) */}
      {institutionalCodes && institutionalCodes.length > 0 && (
        <div className="mt-8 sm:mt-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your License Codes
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Each code is assigned to a specific student email. Share the code with the corresponding student.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {institutionalCodes.map((item) => {
              const status = getCodeStatus(item);
              const isAvailable = status === "Pending";

              return (
                <div
                  key={item.id}
                  className="p-3 sm:p-4 rounded-xl border border-gray-200 bg-white space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-sm font-semibold tracking-wider truncate">
                      {item.code}
                    </p>
                    {isAvailable && (
                      <button
                        onClick={() => handleCopyCode(item.code)}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {copiedCode === item.code ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>

                  {item.authorizedEmail && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{item.authorizedEmail}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getCodeStatusStyle(status)}`}
                    >
                      {status}
                    </span>
                    {item.redeemedBy && (
                      <span className="text-[10px] text-gray-400 truncate">
                        Redeemed by {item.redeemedBy}
                      </span>
                    )}
                    {item.redeemedAt && (
                      <span className="text-[10px] text-gray-400">
                        {new Date(item.redeemedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] text-gray-400">
                    {item.subscription.name} &middot; {item.redemptionCount}/{item.maxRedemptions} used
                  </div>

                  {/* Assign Student (only for pending codes) */}
                  {isAvailable && (
                    <div className="pt-1">
                      {assigningCodeId === item.id ? (
                        <div className="space-y-2">
                          <input
                            type="email"
                            value={assignEmail}
                            onChange={(e) => setAssignEmail(e.target.value)}
                            placeholder="Student email address"
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:border-accent focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (!assignEmail.trim()) {
                                  toast.error("Please enter an email address");
                                  return;
                                }
                                assignCodeMutation.mutate(
                                  { codeId: item.id, email: assignEmail.trim() },
                                  {
                                    onSuccess: () => {
                                      toast.success("Student assigned successfully!");
                                      setAssigningCodeId(null);
                                      setAssignEmail("");
                                    },
                                    onError: (error) => {
                                      const message = (error as {
                                        response?: { data?: { message?: string } };
                                      }).response?.data?.message;
                                      toast.error(
                                        message || "Failed to assign student"
                                      );
                                    },
                                  }
                                );
                              }}
                              disabled={assignCodeMutation.isPending}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent/80 disabled:opacity-50 transition-colors"
                            >
                              {assignCodeMutation.isPending && (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              )}
                              Assign
                            </button>
                            <button
                              onClick={() => {
                                setAssigningCodeId(null);
                                setAssignEmail("");
                              }}
                              className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAssigningCodeId(item.id);
                            setAssignEmail(item.authorizedEmail ?? "");
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                        >
                          <Mail className="h-3 w-3" />
                          Assign Student
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Redeem License Code Section (for students) */}
      <div className="mt-8 sm:mt-10">
        {!showRedeemInput ? (
          <button
            onClick={() => setShowRedeemInput(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-4xl border border-border bg-white hover:bg-gray-50 transition-colors"
          >
            <KeyRound className="h-4 w-4" />
            Have a License Code?
          </button>
        ) : (
          <div className="max-w-md space-y-3 p-4 rounded-xl border border-gray-200 bg-white">
            <p className="text-sm font-medium text-gray-900">
              Redeem License Code
            </p>
            <p className="text-xs text-gray-500">
              Enter the code you received from your school or organization.
            </p>
            <input
              type="text"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              placeholder="Enter license code"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-accent focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleRedeem}
                disabled={!redeemCode.trim() || redeemMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-4xl bg-accent text-white hover:bg-accent/80 transition-colors disabled:opacity-50"
              >
                {redeemMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Redeem
              </button>
              <button
                onClick={() => {
                  setShowRedeemInput(false);
                  setRedeemCode("");
                }}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Subjects Dialog */}
      <Dialog
        open={editingSubscription !== null}
        onOpenChange={(open) => {
          if (!open) setEditingSubscription(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Subjects</DialogTitle>
            <DialogDescription>
              {editingSubscription?.examType}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isLoadingSubjects ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-gray-500 text-sm">
                  Loading subjects...
                </span>
              </div>
            ) : availableSubjects && availableSubjects.length > 0 ? (
              <>
                {(() => {
                  // FLEXIBLE: cap at paid subject count, FIXED: full exam-type max
                  const isFlexible = editingSubscription?.subscription.category === "FLEXIBLE";
                  const maxSubjects = isFlexible
                    ? editingSubscription!.subjects.length
                    : getMaxSubjects(editingSubscription?.examType ?? "");
                  return (
                    <>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3">
                        {isFlexible
                          ? `Swap your subjects (${maxSubjects} included in your plan)`
                          : `Select your subjects (up to ${maxSubjects})`}
                      </p>
                      <SubjectPicker
                        subjects={availableSubjects}
                        value={selectedSubjects}
                        onChange={setSelectedSubjects}
                        maxSubjects={maxSubjects}
                        className="gap-2 sm:gap-3"
                      />
                      <div className="mt-3 text-xs text-[#6B7280]">
                        Selected: {selectedSubjects.length}/{maxSubjects}
                      </div>
                    </>
                  );
                })()}
              </>
            ) : (
              <p className="text-sm text-gray-500 py-4">
                No subjects available for this exam type
              </p>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => setEditingSubscription(null)}
              className="px-4 py-2 text-sm font-medium rounded-4xl border border-border hover:bg-input/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSubjects}
              disabled={
                changeSubjects.isPending || selectedSubjects.length === 0
              }
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-4xl bg-accent text-white hover:bg-accent/80 transition-colors disabled:opacity-50"
            >
              {changeSubjects.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
