import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Logo } from "@/components/global/logo";
import { useVerifyPayment } from "@/feature/payment/hooks";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import PrimaryButton from "@/components/buttons/primary-button";

type PaymentSearchParams = {
  reference?: string;
  trxref?: string;
  returnUrl?: string;
};

function PaymentVerifyPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_auth/payment-verify" });
  const { reset: resetRegistration } = useRegistrationStore();
  const verifyPaymentMutation = useVerifyPayment();

  // Get payment reference from URL params
  const reference = search.reference || search.trxref;

  // Initialize status based on whether reference exists (avoids setState in effect)
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "failed"
  >(() => (reference ? "verifying" : "failed"));

  useEffect(() => {
    if (!reference) {
      return;
    }

    // Verify payment
    verifyPaymentMutation.mutate(
      { reference },
      {
        onSuccess: (data) => {
          if (
            data.verified ||
            data.transaction?.status === "SUCCESS" ||
            (data.message && data.message.toLowerCase().includes("approved"))
          ) {
            setVerificationStatus("success");
          } else {
            setVerificationStatus("failed");
          }
        },
        onError: () => {
          setVerificationStatus("failed");
        },
      }
    );
    // verifyPaymentMutation is stable (from useMutation)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const handleContinue = () => {
    if (verificationStatus === "success") {
      // Clear registration data and go to dashboard
      resetRegistration();
      navigate({ to: "/" });
    } else {
      // Redirect back to where the payment was initiated from (only allow relative paths)
      const returnUrl = search.returnUrl;
      const safeUrl =
        returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")
          ? returnUrl
          : "/checkout";
      navigate({ to: safeUrl });
    }
  };

  return (
    <section className="space-y-6">
      <Logo />

      <div className="flex flex-col items-center justify-center py-10 space-y-6">
        {verificationStatus === "verifying" && (
          <>
            <Loader2 className="h-16 w-16 text-accent animate-spin" />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-[#101828]">
                Verifying Payment
              </h2>
              <p className="text-[#667085]">
                Please wait while we confirm your payment...
              </p>
            </div>
          </>
        )}

        {verificationStatus === "success" && (
          <>
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-[#101828]">
                Payment Successful!
              </h2>
              <p className="text-[#667085]">
                Your subscription has been activated. You can now access all features.
              </p>
              {verifyPaymentMutation.data?.transaction.subscription && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
                  <p className="text-gray-600">
                    <strong>Subscription:</strong>{" "}
                    {verifyPaymentMutation.data.transaction.subscription.name}
                  </p>
                  <p className="text-gray-600">
                    <strong>Duration:</strong>{" "}
                    {verifyPaymentMutation.data.transaction.subscription.duration} days
                  </p>
                </div>
              )}
            </div>
            <PrimaryButton
              onClick={handleContinue}
              className="w-full max-w-md bg-accent hover:bg-accent/80 text-white"
              title="Go to Dashboard"
            />
          </>
        )}

        {verificationStatus === "failed" && (
          <>
            <div className="bg-red-100 rounded-full p-4">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-[#101828]">
                Payment Failed
              </h2>
              <p className="text-[#667085]">
                {verifyPaymentMutation.data?.message ||
                  verifyPaymentMutation.error?.response?.data?.message ||
                  "We couldn't verify your payment. Please try again or contact support."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <PrimaryButton
                onClick={handleContinue}
                className="flex-1 bg-accent hover:bg-accent/80 text-white"
                title="Try Again"
              />
              <button
                onClick={() => navigate({ to: "/" })}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-accent/50"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export const Route = createFileRoute("/_auth/payment-verify")({
  validateSearch: (search: Record<string, unknown>): PaymentSearchParams => {
    return {
      reference: search.reference as string | undefined,
      trxref: search.trxref as string | undefined,
      returnUrl: search.returnUrl as string | undefined,
    };
  },
  component: PaymentVerifyPage,
});
