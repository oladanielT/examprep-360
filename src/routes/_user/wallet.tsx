import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useWalletBalance, useWalletTransactions, useWithdraw } from "@/feature/wallet/hooks";
import {
  Loader2,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

function WalletPage() {
  const [page, setPage] = useState(1);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
  });

  const { data: balance, isLoading: balanceLoading } = useWalletBalance();
  const { data: transactionsData, isLoading: txLoading } = useWalletTransactions(page, 10);
  const withdrawMutation = useWithdraw();

  const handleWithdraw = () => {
    const amount = Number(withdrawForm.amount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!withdrawForm.bankName.trim()) {
      toast.error("Please enter your bank name");
      return;
    }
    if (!withdrawForm.accountName.trim()) {
      toast.error("Please enter the account name");
      return;
    }
    if (!withdrawForm.accountNumber.trim() || withdrawForm.accountNumber.length < 10) {
      toast.error("Please enter a valid account number");
      return;
    }

    withdrawMutation.mutate(
      {
        amount,
        bankName: withdrawForm.bankName.trim(),
        accountName: withdrawForm.accountName.trim(),
        accountNumber: withdrawForm.accountNumber.trim(),
      },
      {
        onSuccess: (res) => {
          toast.success(res.message || "Withdrawal request submitted!");
          setWithdrawOpen(false);
          setWithdrawForm({ amount: "", bankName: "", accountName: "", accountNumber: "" });
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "Withdrawal failed. Please try again.");
        },
      }
    );
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-green-100 text-green-700",
      pending: "bg-amber-100 text-amber-700",
      failed: "bg-red-100 text-red-700",
      processing: "bg-blue-100 text-blue-700",
    };
    return (
      <span
        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || "bg-gray-100 text-gray-700"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div>
      <CustomPageHeader
        backLink="/"
        search={false}
        heading="Wallet"
        subHeading="Manage your earnings and withdrawals"
      />

      <div className="py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Balance Card */}
        <Card className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                {balanceLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mt-1" />
                ) : (
                  <p className="text-2xl sm:text-3xl font-bold">
                    {formatCurrency(balance?.balance ?? 0)}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={() => setWithdrawOpen(true)}
              disabled={!balance?.balance || balance.balance <= 0}
            >
              Withdraw
            </Button>
          </div>
        </Card>

        {/* Transaction History */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
          <Card className="divide-y">
            {txLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : !transactionsData?.transactions?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              <>
                {transactionsData.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-4 sm:px-5 py-3.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          tx.type === "credit"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {tx.type === "credit" ? (
                          <ArrowDownLeft className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span
                        className={`text-sm font-semibold ${
                          tx.type === "credit" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </span>
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {transactionsData.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {transactionsData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= transactionsData.totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Enter your bank details to withdraw your earnings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (NGN)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={withdrawForm.amount}
                onChange={(e) =>
                  setWithdrawForm((f) => ({ ...f, amount: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="e.g. First Bank"
                value={withdrawForm.bankName}
                onChange={(e) =>
                  setWithdrawForm((f) => ({ ...f, bankName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                placeholder="e.g. John Doe"
                value={withdrawForm.accountName}
                onChange={(e) =>
                  setWithdrawForm((f) => ({ ...f, accountName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="0123456789"
                value={withdrawForm.accountNumber}
                onChange={(e) =>
                  setWithdrawForm((f) => ({ ...f, accountNumber: e.target.value }))
                }
              />
            </div>
            <Button
              className="w-full"
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Withdrawal"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createFileRoute("/_user/wallet")({
  component: WalletPage,
});
