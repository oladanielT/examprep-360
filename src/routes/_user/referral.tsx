import { createFileRoute } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useReferralData,
  useReferralStats,
  useClaimReward,
} from "@/feature/referral/hooks";
import {
  Loader2,
  Copy,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  Gift,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import type { ReferralReward } from "@/api/types";

function formatRewardValue(reward: ReferralReward): string {
  const value = reward.rewardValue;
  if (value && typeof value === "object" && "amount" in value) {
    const amt = (value as { amount: number }).amount;
    return `₦${amt.toLocaleString()}`;
  }
  return JSON.stringify(value);
}

function formatRewardType(type: string): string {
  if (type === "WALLET_CREDIT") return "Wallet credit";
  return type
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ReferralPage() {
  const { data, isLoading } = useReferralData();
  const { data: stats, isLoading: statsLoading } = useReferralStats();
  const claimReward = useClaimReward();

  const handleClaim = (rewardId: string) => {
    claimReward.mutate(rewardId, {
      onSuccess: (res) => toast.success(res?.message || "Reward claimed!"),
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message || err?.message || "Failed to claim reward."
        );
      },
    });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Build the share link from the current site origin so it always matches
  // the URL the user is actually on (the backend's shareUrl points at a
  // placeholder domain). Fall back to the API's shareUrl only if no code.
  const shareUrl = data?.code
    ? `${window.location.origin}/welcome?ref=${data.code}`
    : data?.shareUrl || "";

  if (isLoading) {
    return (
      <div>
        <CustomPageHeader
          backLink="/"
          search={false}
          heading="Referral Program"
          subHeading="Invite friends and earn rewards"
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <CustomPageHeader
        backLink="/"
        search={false}
        heading="Referral Program"
        subHeading="Invite friends and earn rewards"
      />

      <div className="py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Referral Code Card */}
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Your Referral Code</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Code</label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-muted rounded-md px-4 py-2.5 font-mono text-lg font-semibold tracking-wider">
                  {data?.code || "—"}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(data?.code || "", "Referral code")}
                  disabled={!data?.code}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Share Link</label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-muted rounded-md px-4 py-2.5 text-sm truncate">
                  {shareUrl || "—"}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(shareUrl, "Share link")}
                  disabled={!shareUrl}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">
                {statsLoading ? "—" : (stats?.totalReferrals ?? 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
            </Card>

            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">
                {statsLoading ? "—" : (stats?.completedReferrals ?? 0)}
              </p>
              <p className="text-sm text-muted-foreground">Conversions</p>
            </Card>

            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">
                {statsLoading ? "—" : (stats?.pendingReferrals ?? 0)}
              </p>
              <p className="text-sm text-muted-foreground">Pending Referrals</p>
            </Card>

            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">
                {statsLoading ? "—" : (stats?.totalRewards ?? 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Rewards</p>
            </Card>
          </div>
        </div>

        {/* Referrals list */}
        <div>
          <h2 className="text-lg font-semibold mb-4">People You've Referred</h2>
          {statsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (stats?.referrals?.length ?? 0) === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              No referrals yet. Share your code to get started.
            </Card>
          ) : (
            <div className="space-y-3">
              {stats!.referrals.map((r) => {
                const isCompleted = r.status === "COMPLETED";
                const isPending = r.status === "PENDING";
                return (
                  <Card key={r.id} className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {r.referredStudent}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{r.referredEmail}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Joined {formatDate(r.createdAt)}
                            {isCompleted && r.completedAt && (
                              <> · Completed {formatDate(r.completedAt)}</>
                            )}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-medium px-2 py-1 rounded-full shrink-0 ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-700"
                            : isPending
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Rewards list */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Rewards</h2>
          {statsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (stats?.rewards?.length ?? 0) === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              No rewards yet. Referrals that convert will earn you rewards.
            </Card>
          ) : (
            <div className="space-y-3">
              {stats!.rewards.map((reward) => (
                <Card key={reward.id} className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <Gift className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">
                          {formatRewardType(reward.rewardType)} ·{" "}
                          <span className="text-emerald-700">
                            {formatRewardValue(reward)}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {reward.claimed && reward.claimedAt
                            ? `Claimed ${formatDate(reward.claimedAt)}`
                            : reward.expiresAt
                              ? `Expires ${formatDate(reward.expiresAt)}`
                              : "Available to claim"}
                        </p>
                      </div>
                    </div>
                    {reward.claimed ? (
                      <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                        CLAIMED
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleClaim(reward.id)}
                        disabled={
                          claimReward.isPending &&
                          claimReward.variables === reward.id
                        }
                        className="shrink-0"
                      >
                        {claimReward.isPending &&
                        claimReward.variables === reward.id
                          ? "Claiming..."
                          : "Claim"}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_user/referral")({
  component: ReferralPage,
});
