import { Link } from "@tanstack/react-router";
import { Loader2, Trash2, ArrowRightLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  useSubscriptions,
  useDeleteSubscription,
  useSwitchSubscription,
} from "./hooks/useSubscription";
import { useExamPreferences } from "@/feature/exams/hooks";
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

export const SubscriptionSection = () => {
  const { data: subscriptions, isLoading } = useSubscriptions();
  const { data: preferences } = useExamPreferences();
  const deleteMutation = useDeleteSubscription();
  const switchMutation = useSwitchSubscription();

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
    </section>
  );
};
