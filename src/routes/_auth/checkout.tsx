import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/global/logo";
import PrimaryButton from "@/components/buttons/primary-button";
import { Alert } from "@/components/ui/alert";
import { useRegistrationStore } from "@/stores/registrationStore";
import { usePaymentPlans, useInitializePayment, useRedeemLicense, useStartTrial } from "@/feature/payment/hooks";
import { Check } from "lucide-react";
import { useState } from "react";

function CheckoutPage() {
  const navigate = useNavigate();
  const { data: registrationData, reset: resetRegistration } = useRegistrationStore();
  const [showLicenseInput, setShowLicenseInput] = useState(false);
  const [licenseCode, setLicenseCode] = useState("");

  // Get user's selected plan from registration data
  const subscriptionPlanId = registrationData.duration; // This is the plan ID
  const examType = registrationData.examType;
  const examCategory = registrationData.category;
  const numberOfStudents = registrationData.isInstitutional ? registrationData.students : undefined;

  // Fetch all plans to find the selected one
  const { data: plans, isLoading: isLoadingPlans } = usePaymentPlans(
    examCategory,
    examType
  );

  const initializePaymentMutation = useInitializePayment();
  const redeemLicenseMutation = useRedeemLicense();
  const startTrialMutation = useStartTrial();

  // Find the selected plan
  const selectedPlan = plans?.find((p) => p.id === subscriptionPlanId);

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
      // Get callback URL - this will be the current domain + /payment-verify
      const callbackUrl = `${window.location.origin}/payment-verify`;

      const response = await initializePaymentMutation.mutateAsync({
        studentId: registrationData.studentId,
        subscriptionId: selectedPlan.id,
        amount: totalPrice,
        subscriptionType: registrationData.isInstitutional ? "INSTITUTIONAL" : "INDIVIDUAL",
        numberOfSubjects: registrationData.subjects.length,
        numberOfStudents: registrationData.isInstitutional ? registrationData.students : 1,
        schoolType: examCategory,
        examType: examType,
        numberOfDays: selectedPlan.duration,
        metadata: {
          callbackUrl,
        },
      });

      // Redirect to payment gateway
      if (response.authorizationUrl) {
        window.location.href = response.authorizationUrl;
      }
    } catch (error) {
      console.error("Payment initialization failed:", error);
    }
  };

  const handleRedeemLicense = async () => {
    if (!licenseCode) return;

    try {
      const response = await redeemLicenseMutation.mutateAsync({
        licenseCode,
      });

      if (response.success) {
        // Clear registration data and navigate to dashboard
        resetRegistration();
        navigate({ to: "/" });
      }
    } catch (error) {
      console.error("License redemption failed:", error);
    }
  };

  const handleStartTrial = async () => {
    if (!selectedPlan || !registrationData.studentId) {
      console.error("Missing required data for trial");
      return;
    }

    try {
      const response = await startTrialMutation.mutateAsync({
        studentId: registrationData.studentId,
        subscriptionId: selectedPlan.id,
      });

      if (response.success) {
        // Clear registration data and navigate to login page
        resetRegistration();
        navigate({ to: "/sign-in" });
      }
    } catch (error) {
      console.error("Trial start failed:", error);
    }
  };

  const handleSkip = () => {
    // Navigate to home/dashboard
    navigate({ to: "/" });
  };

  if (isLoadingPlans) {
    return (
      <section className="space-y-6">
        <Logo />
        <div className="text-center py-10">
          <p className="text-gray-500">Loading payment details...</p>
        </div>
      </section>
    );
  }

  if (!selectedPlan || !registrationData.studentId) {
    return (
      <section className="space-y-6">
        <Logo />
        <div className="text-center py-10">
          <Alert variant="destructive">
            {!selectedPlan
              ? "No subscription plan selected. Please contact support."
              : "Missing student information. Please complete registration first."}
          </Alert>
          <button
            onClick={handleSkip}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            {registrationData.studentId ? "Continue to Dashboard" : "Go Back to Registration"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Logo />

      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-3xl font-bold tracking-tight text-[#101828]">
            Complete Your Subscription
          </h2>
          <p className="text-[#667085] text-sm md:text-base">
            You're almost there! Complete payment to unlock all features.
          </p>
        </div>

        {/* Plan Card */}
        <div className="bg-linear-to-br from-accent/5 to-accent/10 rounded-xl p-6 border-2 border-accent/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-[#101828]">
                {selectedPlan.name}
              </h3>
              <p className="text-sm text-gray-600">{selectedPlan.description}</p>
            </div>
            <div className="text-right">
              <div className="text-xl md:text-3xl font-bold text-accent">
                {selectedPlan.currency} {totalPrice.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                for {selectedPlan.duration} days
              </div>
              {numberOfStudents && (
                <div className="text-xs text-gray-500 mt-1">
                  ({numberOfStudents} students)
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          {selectedPlan.features && selectedPlan.features.length > 0 && (
            <div className="space-y-2 mt-4 pt-4 border-t">
              <p className="text-sm font-medium text-gray-700">Features:</p>
              {selectedPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-accent" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {initializePaymentMutation.isError && (
          <Alert variant="destructive">
            {initializePaymentMutation.error?.response?.data?.message ||
              "Failed to initialize payment. Please try again."}
          </Alert>
        )}

        {redeemLicenseMutation.isError && (
          <Alert variant="destructive">
            {redeemLicenseMutation.error?.response?.data?.message ||
              "Failed to redeem license code. Please check and try again."}
          </Alert>
        )}

        {startTrialMutation.isError && (
          <Alert variant="destructive">
            {startTrialMutation.error?.response?.data?.message ||
              "Failed to start trial. Please try again."}
          </Alert>
        )}

        {/* Payment Options */}
        <div className="space-y-3">
          <PrimaryButton
            onClick={handlePayNow}
            disabled={initializePaymentMutation.isPending}
            className="w-full bg-accent hover:bg-accent/80 text-white text-lg"
            title={
              initializePaymentMutation.isPending
                ? "Processing..."
                : "Pay Now"
            }
          />

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
              <div className="space-y-2">
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

          {/* Free Trial - if available */}
          <button
            onClick={handleStartTrial}
            disabled={startTrialMutation.isPending}
            className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-accent/50 transition-colors disabled:opacity-50"
          >
            {startTrialMutation.isPending ? "Starting Trial..." : "Start Free Trial"}
          </button>

          {/* Skip for now */}
          <button
            onClick={handleSkip}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            I'll do this later
          </button>
        </div>
      </div>
    </section>
  );
}

export const Route = createFileRoute("/_auth/checkout")({
  component: CheckoutPage,
});
