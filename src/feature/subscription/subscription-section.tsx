import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Trash2, ArrowRightLeft, Plus, Pencil, Copy, Check, KeyRound, Mail, Crown } from "lucide-react";
import { toast } from "sonner";
import {
  useSubscriptions,
  useDeleteSubscription,
  useSwitchSubscription,
  useChangeSubscriptionSubjects,
} from "./hooks/useSubscription";
import { useInstitutionalCodes, useRedeemLicense, useAssignCode } from "@/feature/payment/hooks";
import { useExamPreferences, useExamSubjects } from "@/feature/exams/hooks";
import { useRegistrationStore } from "@/stores/registrationStore";
import type { InstitutionalCode } from "@/api/types";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { UserSubscription } from "@/api/types";

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

export const SubscriptionSection = () => {
  const navigate = useNavigate();
  const { data: subscriptions, isLoading } = useSubscriptions();
  const { data: preferences } = useExamPreferences();
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

  if (isLoading) {
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

      {!subscriptions || subscriptions.length === 0 ? (
        <p className="text-gray-500 py-6">
          No subscriptions yet. Add one to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="bg-[#FFFBEB] rounded-xl border border-amber-100 p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {sub.examType}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {sub.subjects.length} Subject
                    {sub.subjects.length !== 1 ? "s" : ""} &middot;{" "}
                    {sub.subscription.name}
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
                {sub.status === "ACTIVE" && (
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
                        Are you sure you want to delete your {sub.examType}{" "}
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
          ))}
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
                                    onError: (error: any) => {
                                      toast.error(
                                        error.response?.data?.message ||
                                          "Failed to assign student"
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
                      <ToggleGroup
                        multiple
                        value={selectedSubjects}
                        onValueChange={(value) => {
                          // Single-subject exams (Post-UTME): tapping another swaps it.
                          if (maxSubjects === 1) {
                            setSelectedSubjects(value.slice(-1));
                          } else if (value.length <= maxSubjects) {
                            setSelectedSubjects(value);
                          }
                        }}
                        className="flex flex-wrap gap-2 sm:gap-3"
                      >
                        {availableSubjects.map((subject) => {
                          const isSelected = selectedSubjects.includes(subject.id);
                          const atLimit =
                            maxSubjects > 1 && selectedSubjects.length >= maxSubjects && !isSelected;
                          return (
                            <ToggleGroupItem
                              key={subject.id}
                              value={subject.id}
                              disabled={atLimit}
                              className={cn(
                                "h-auto py-3 sm:py-4 px-3 sm:px-4 rounded-sm! border-2",
                                "inline-flex items-center justify-center max-w-full",
                                // whitespace-normal overrides the nowrap baked
                                // into toggleVariants, which the label inherits.
                                "text-[11px] sm:text-xs font-medium text-center whitespace-normal break-words",
                                "transition-all duration-200",
                                "hover:border-accent hover:bg-accent/5",
                                "data-[state=on]:border-accent/70 data-[state=on]:bg-transparent data-[state=on]:text-black",
                                isSelected
                                  ? "border-accent"
                                  : "border-[#E5E5E5] text-black",
                                atLimit && "opacity-50 cursor-not-allowed"
                              )}
                              aria-label={subject.name}
                            >
                              {subject.name}
                            </ToggleGroupItem>
                          );
                        })}
                      </ToggleGroup>
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
