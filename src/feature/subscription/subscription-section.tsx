import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Link } from "@tanstack/react-router";
import { Loader2, Trash2, ArrowRightLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  useSubscriptions,
  useDeleteSubscription,
  useSwitchSubscription,
} from "./hooks/useSubscription";
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
  const deleteMutation = useDeleteSubscription();
  const switchMutation = useSwitchSubscription();

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
    <section>
      <div className="py-6">
        <Link
          to="/subscription/add"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-4xl border border-border bg-accent text-white hover:bg-accent/80 transition-colors"
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
        <section className="flex flex-wrap gap-6">
          {subscriptions.map((sub) => (
            <Item key={sub.id} className="h-fit bg-[#FFF0B333] w-80">
              <ItemContent>
                <ItemTitle className="text-lg font-semibold">
                  {sub.examType}
                </ItemTitle>
                <ItemDescription>
                  {sub.subjects.length} Subject
                  {sub.subjects.length !== 1 ? "s" : ""} &middot;{" "}
                  {sub.subscription.name}
                </ItemDescription>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
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
              </ItemContent>
              <ItemMedia className="w-24 h-20" variant="image">
                <img
                  src="/svg/note.svg"
                  alt=""
                  width={32}
                  height={32}
                  className="w-full"
                />
              </ItemMedia>
              <ItemActions className="flex gap-2 mt-2">
                {sub.status === "ACTIVE" && (
                  <span className="text-xs text-accent font-medium px-2 py-1">
                    Current Focus
                  </span>
                )}
                {sub.status !== "ACTIVE" && (
                  <button
                    onClick={() => handleSwitch(sub.id)}
                    disabled={switchMutation.isPending}
                    className="inline-flex items-center gap-1 h-8 px-3 text-xs font-medium rounded-4xl border border-border bg-input/30 hover:bg-input/50 transition-colors disabled:opacity-50"
                  >
                    <ArrowRightLeft className="h-3 w-3" />
                    Switch
                  </button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={deleteMutation.isPending}
                      className="inline-flex items-center gap-1 h-8 px-3 text-xs font-medium rounded-4xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
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
              </ItemActions>
            </Item>
          ))}
        </section>
      )}
    </section>
  );
};
