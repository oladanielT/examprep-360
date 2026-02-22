import { createFileRoute } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReferralData, useClaimReward } from "@/feature/referral/hooks";
import { Loader2, Copy, Users, CheckCircle, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";

function ReferralPage() {
  const { data, isLoading } = useReferralData();
  const claimReward = useClaimReward();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const shareUrl = data?.code
    ? `${window.location.origin}/welcome?ref=${data.code}`
    : "";

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
              <p className="text-2xl font-bold">{data?.totalReferrals ?? 0}</p>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
            </Card>

            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">{data?.completedReferrals ?? 0}</p>
              <p className="text-sm text-muted-foreground">Conversions</p>
            </Card>

            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">{data?.pendingReferrals ?? 0}</p>
              <p className="text-sm text-muted-foreground">Pending Referrals</p>
            </Card>

            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">{data?.totalRewards ?? 0}</p>
              <p className="text-sm text-muted-foreground">Total Rewards</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_user/referral")({
  component: ReferralPage,
});
