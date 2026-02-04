import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/global/logo";
import PrimaryButton from "@/components/buttons/primary-button";
import { Alert } from "@/components/ui/alert";
import { useRegistrationStore } from "@/stores/registrationStore";
import { usePaymentPlans, useInitializePayment, useRedeemLicense, useStartTrial } from "@/feature/payment/hooks";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function CheckoutPage() {
  const navigate = useNavigate();
  const { data: registrationData, reset: resetRegistration } = useRegistrationStore();
  const [showLicenseInput, setShowLicenseInput] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [licenseCode, setLicenseCode] = useState("");
  const [trialStarted, setTrialStarted] = useState(false);

  const examType = registrationData.examType;
  const examCategory = registrationData.category;
  const numberOfStudents = registrationData.isInstitutional ? registrationData.students : undefined;


  // Fetch plans based on subscription type (BODY for institutional, INDIVIDUAL for regular)
  const subscriptionType = registrationData.isInstitutional ? "BODY" : "INDIVIDUAL";
  const { data: plans, isLoading: isLoadingPlans } = usePaymentPlans(
    examCategory,
    examType,
    subscriptionType
  );

  const initializePaymentMutation = useInitializePayment();
  const redeemLicenseMutation = useRedeemLicense();
  const startTrialMutation = useStartTrial();

  // Find the selected plan
  const selectedPlan = plans?.find((p) => p.id === selectedPlanId);

  // Calculate total price for institutional
  const totalPrice = selectedPlan
    ? numberOfStudents && selectedPlan.pricePerStudent
      ? selectedPlan.basePrice + (numberOfStudents * selectedPlan.pricePerStudent)
      : selectedPlan.basePrice
    : 0;

  const handlePayNow = async () => {
    if (!selectedPlan || !registrationData.studentId) {
      console.error("Missing required data for payment");
      return;
    }

    try {
      const callbackUrl = `${window.location.origin}/payment-verify?returnUrl=${encodeURIComponent("/checkout")}`;

      const response = await initializePaymentMutation.mutateAsync({
        studentId: registrationData.studentId,
        subscriptionId: selectedPlan.id,
        amount: totalPrice,
        subscriptionType: registrationData.isInstitutional ? "BODY" : "INDIVIDUAL",
        numberOfSubjects: registrationData.subjects.length,
        numberOfStudents: registrationData.isInstitutional ? registrationData.students : 1,
        schoolType: examCategory,
        examType: examType,
        numberOfDays: selectedPlan.duration,
        metadata: {
          callbackUrl,
        },
      });

      // Get payment URL from response
      const paymentUrl = (response as any).paymentUrl;
      const accessCode = (response as any).accessCode;

      if (paymentUrl) {
        // Redirect to Paystack checkout page
        window.location.href = paymentUrl;
      } else if (accessCode) {
        // Fallback: use access code to build URL
        window.location.href = `https://checkout.paystack.com/${accessCode}`;
      } else {
        toast.error("Payment initialization failed", {
          description: "Could not get payment URL. Please try again.",
        });
      }
    } catch (error) {
      console.error("Payment initialization failed:", error);
    }
  };

  const handleRedeemLicense = async () => {
    if (!licenseCode || !registrationData.studentId) return;

    try {
      const response = await redeemLicenseMutation.mutateAsync({
        code: licenseCode,
        studentId: registrationData.studentId,
        subjects: registrationData.subjects,
        courses: [],
      });

      // Response returns subscription object directly (has id if successful)
      if (response && ((response as any).id || (response as any).success)) {
        toast.success("License code redeemed!", {
          description: "Your subscription has been activated.",
          duration: 4000,
        });
        // Small delay to ensure toast is visible
        setTimeout(() => {
          resetRegistration();
          navigate({ to: "/sign-in" });
        }, 1000);
      }
    } catch (error) {
      console.error("License redemption failed:", error);
    }
  };

  const handleStartTrial = async () => {
    if (!registrationData.studentId) {
      console.error("Missing student ID for trial");
      return;
    }

    // For free trial, use the selected plan or first available
    const trialPlan = selectedPlanId ? plans?.find(p => p.id === selectedPlanId) : plans?.[0];
    if (!trialPlan) {
      console.error("No plans available for trial");
      return;
    }

    try {
      const response = await startTrialMutation.mutateAsync({
        studentId: registrationData.studentId,
        subscriptionId: trialPlan.id,
      });

      // Response might have success:true or just return trial data
      if (response && ((response as any).success || (response as any).trialEndDate || (response as any).id)) {
        setTrialStarted(true);
        toast.success("Free trial started!", {
          description: "You can now sign in to access all features.",
        });
        // Wait a moment then navigate
        setTimeout(() => {
          resetRegistration();
          navigate({ to: "/sign-in" });
        }, 1500);
      }
    } catch (error) {
      console.error("Trial start failed:", error);
    }
  };

  const handleSkip = () => {
    navigate({ to: "/" });
  };

  if (!registrationData.studentId) {
    return (
      <section className="space-y-6">
        <Logo />
        <div className="text-center py-10">
          <Alert variant="destructive">
            Missing student information. Please complete registration first.
          </Alert>
          <button
            onClick={() => navigate({ to: "/welcome" })}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            Go Back to Registration
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Logo />

      <div className="space-y-4 max-w-md mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-3xl font-bold tracking-tight text-[#101828]">
            {showPaymentOptions ? "Choose a Plan" : "You're Almost Done!"}
          </h2>
          <p className="text-[#667085] text-sm md:text-base">
            {showPaymentOptions
              ? "Select a subscription plan to continue with payment."
              : "Start your free trial or choose to pay now."}
          </p>
        </div>

        {startTrialMutation.isError && (
          <Alert variant="destructive">
            {startTrialMutation.error?.response?.data?.message ||
              "Failed to start trial. Please try again."}
          </Alert>
        )}

        {redeemLicenseMutation.isError && (
          <Alert variant="destructive">
            {redeemLicenseMutation.error?.response?.data?.message ||
              "Failed to redeem license code. Please check and try again."}
          </Alert>
        )}

        {initializePaymentMutation.isError && (
          <Alert variant="destructive">
            {initializePaymentMutation.error?.response?.data?.message ||
              "Failed to initialize payment. Please try again."}
          </Alert>
        )}

        {!showPaymentOptions ? (
          // Main options: Free Trial, Pay, License Code
          <div className="space-y-4">
            {/* Free Trial - Primary Option */}
            <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl p-6 border-2 border-accent/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-accent text-white text-xs font-semibold px-2 py-1 rounded">
                  RECOMMENDED
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#101828] mb-1">
                Start Free Trial
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Try all features free for 7 days. No payment required.
              </p>
              <PrimaryButton
                onClick={handleStartTrial}
                disabled={startTrialMutation.isPending || isLoadingPlans || trialStarted}
                className="w-full bg-accent hover:bg-accent/80 text-white text-lg"
                title={
                  trialStarted
                    ? "Trial Started!"
                    : startTrialMutation.isPending
                      ? "Starting Trial..."
                      : isLoadingPlans
                        ? "Loading..."
                        : "Start Free Trial"
                }
              />
            </div>

            {/* Pay Now Option */}
            <button
              onClick={() => setShowPaymentOptions(true)}
              className="w-full py-4 px-6 border-2 border-gray-200 rounded-xl text-left hover:border-accent/50 transition-colors"
            >
              <h3 className="font-semibold text-[#101828]">Pay Now</h3>
              <p className="text-sm text-gray-500">
                Choose a subscription plan and pay to get started immediately.
              </p>
            </button>

            {/* License Code */}
            <div className="relative">
              {!showLicenseInput ? (
                <button
                  onClick={() => setShowLicenseInput(true)}
                  className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-accent/50 transition-colors"
                >
                  Have a License Code?
                </button>
              ) : (
                <div className="space-y-2 p-4 border-2 border-gray-200 rounded-xl">
                  <input
                    type="text"
                    value={licenseCode}
                    onChange={(e) => setLicenseCode(e.target.value)}
                    placeholder="Enter license code"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleRedeemLicense}
                      disabled={!licenseCode || redeemLicenseMutation.isPending}
                      className="flex-1 py-2 px-4 bg-accent text-white rounded-xl disabled:opacity-50"
                    >
                      {redeemLicenseMutation.isPending ? "Redeeming..." : "Redeem"}
                    </button>
                    <button
                      onClick={() => {
                        setShowLicenseInput(false);
                        setLicenseCode("");
                      }}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Skip */}
            <button
              onClick={handleSkip}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
            >
              I'll do this later
            </button>
          </div>
        ) : (
          // Plan Selection
          <div className="space-y-4">
            {isLoadingPlans ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : plans && plans.length > 0 ? (
              <>
                <div className="space-y-3">
                  {plans.map((plan) => {
                    const planTotal = numberOfStudents && plan.pricePerStudent
                      ? plan.basePrice + (numberOfStudents * plan.pricePerStudent)
                      : plan.basePrice;

                    return (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 text-left transition-all",
                          selectedPlanId === plan.id
                            ? "border-accent bg-accent/5"
                            : "border-gray-200 hover:border-accent/50"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-[#101828]">{plan.name}</h4>
                            <p className="text-sm text-gray-500">{plan.duration} days</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-accent">
                              {plan.currency} {planTotal.toLocaleString()}
                            </div>
                            {numberOfStudents && (
                              <div className="text-xs text-gray-500">
                                ({numberOfStudents} students)
                              </div>
                            )}
                          </div>
                        </div>
                        {plan.features && plan.features.length > 0 && (
                          <div className="mt-3 pt-3 border-t space-y-1">
                            {plan.features.slice(0, 3).map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                <Check className="h-3 w-3 text-accent" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <PrimaryButton
                  onClick={handlePayNow}
                  disabled={!selectedPlanId || initializePaymentMutation.isPending}
                  className="w-full bg-accent hover:bg-accent/80 text-white text-lg disabled:opacity-50"
                  title={
                    initializePaymentMutation.isPending
                      ? "Processing..."
                      : selectedPlan
                        ? `Pay ${selectedPlan.currency} ${totalPrice.toLocaleString()}`
                        : "Select a Plan"
                  }
                />

                <button
                  onClick={() => {
                    setShowPaymentOptions(false);
                    setSelectedPlanId(null);
                  }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
                >
                  Back to Options
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No plans available.</p>
                <button
                  onClick={() => setShowPaymentOptions(false)}
                  className="mt-4 text-sm text-accent hover:text-accent/80"
                >
                  Go Back
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export const Route = createFileRoute("/_auth/checkout")({
  component: CheckoutPage,
});
