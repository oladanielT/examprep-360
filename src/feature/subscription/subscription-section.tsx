import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Trash2, ArrowRightLeft, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  useSubscriptions,
  useDeleteSubscription,
  useSwitchSubscription,
  useChangeSubscriptionSubjects,
} from "./hooks/useSubscription";
import { useExamPreferences, useExamSubjects } from "@/feature/exams/hooks";
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

export const SubscriptionSection = () => {
  const { data: subscriptions, isLoading } = useSubscriptions();
  const { data: preferences } = useExamPreferences();
  const deleteMutation = useDeleteSubscription();
  const switchMutation = useSwitchSubscription();
  const changeSubjects = useChangeSubscriptionSubjects();

  const [editingSubscription, setEditingSubscription] =
    useState<UserSubscription | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

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
    setSelectedSubjects(sub.subjects);
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
                <ToggleGroup
                  multiple
                  value={selectedSubjects}
                  onValueChange={(value) => {
                    if (value.length <= 9) setSelectedSubjects(value);
                  }}
                  className="flex flex-wrap gap-2 sm:gap-3"
                >
                  {availableSubjects.map((subject) => {
                    const isSelected = selectedSubjects.includes(subject.id);
                    const atLimit =
                      selectedSubjects.length >= 9 && !isSelected;
                    return (
                      <ToggleGroupItem
                        key={subject.id}
                        value={subject.id}
                        disabled={atLimit}
                        className={cn(
                          "h-auto py-3 sm:py-4 px-3 sm:px-4 rounded-sm! border-2",
                          "inline-flex items-center justify-center shrink-0",
                          "text-[11px] sm:text-xs font-medium text-center whitespace-nowrap",
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
                  Selected: {selectedSubjects.length}/9
                </div>
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
