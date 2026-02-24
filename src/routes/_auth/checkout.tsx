import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/global/logo";
import PrimaryButton from "@/components/buttons/primary-button";
import { Alert } from "@/components/ui/alert";
import { useRegistrationStore } from "@/stores/registrationStore";
import { usePaymentPlans, useInitializePayment, useRedeemLicense, useStartTrial } from "@/feature/payment/hooks";
import { Check, Loader2, Plus, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [studentEmails, setStudentEmails] = useState<string[]>(
    registrationData.isInstitutional
      ? Array(registrationData.students).fill("")
      : []
  );

  useEffect(() => {
    return () => {
      if (navigationTimerRef.current) clearTimeout(navigationTimerRef.current);
    };
  }, []);

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

  const validateStudentEmails = (): boolean => {
    if (!registrationData.isInstitutional) return true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmed = studentEmails.map((e) => e.trim().toLowerCase());

    for (let i = 0; i < trimmed.length; i++) {
      if (!trimmed[i]) {
        toast.error(`Please enter email for student ${i + 1}`);
        return false;
      }
      if (!emailRegex.test(trimmed[i])) {
        toast.error(`Invalid email format for student ${i + 1}`);
        return false;
      }
    }

    const unique = new Set(trimmed);
    if (unique.size !== trimmed.length) {
      toast.error("Each student must have a unique email address");
      return false;
    }

    if (trimmed.length !== registrationData.students) {
      toast.error(`The number of emails must match the number of students (${registrationData.students})`);
      return false;
    }

    return true;
  };

  const handlePayNow = async () => {
    if (!selectedPlan || !registrationData.studentId) {
      console.error("Missing required data for payment");
      return;
    }

    if (!validateStudentEmails()) return;

    try {
      const callbackUrl = `${window.location.origin}/payment-verify?returnUrl=${encodeURIComponent("/checkout")}`;
      const trimmedEmails = registrationData.isInstitutional
        ? studentEmails.map((e) => e.trim().toLowerCase()).filter(Boolean)
        : undefined;

      const response = await initializePaymentMutation.mutateAsync({
        studentId: registrationData.studentId,
        subscriptionId: selectedPlan.id,
        amount: totalPrice,
        subscriptionType: registrationData.isInstitutional ? "BODY" : "INDIVIDUAL",
        numberOfSubjects: registrationData.subjects.length,
        numberOfStudents: registrationData.isInstitutional ? registrationData.students : 1,
        ...(trimmedEmails && { studentEmails: trimmedEmails }),
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
        navigationTimerRef.current = setTimeout(() => {
          resetRegistration();
          navigate({ to: "/sign-in" });
        }, 1000);
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 403) {
        toast.error("This code was assigned to a different email address. Please contact your institution.");
      } else if (status === 404) {
        toast.error("This license code is invalid. Please check and try again.");
      } else {
        toast.error(message || "Failed to redeem license code.");
      }
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
        navigationTimerRef.current = setTimeout(() => {
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
          // Main options: Pay Now, Free Trial, License Code
          <div className="space-y-4">
            {/* Pay Now - Primary/Recommended Option */}
            <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl p-6 border-2 border-accent/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-accent text-white text-xs font-semibold px-2 py-1 rounded">
                  RECOMMENDED
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#101828] mb-1">
                Pay Now
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose a subscription plan and get started immediately.
              </p>
              <PrimaryButton
                onClick={() => setShowPaymentOptions(true)}
                className="w-full bg-accent hover:bg-accent/80 text-white text-lg"
                title="Pay Now"
              />
            </div>

            {/* Free Trial Option */}
            <button
              onClick={handleStartTrial}
              disabled={startTrialMutation.isPending || isLoadingPlans || trialStarted}
              className="w-full py-4 px-6 border-2 border-gray-200 rounded-xl text-left hover:border-accent/50 transition-colors disabled:opacity-50"
            >
              <h3 className="font-semibold text-[#101828]">
                {trialStarted
                  ? "Trial Started!"
                  : startTrialMutation.isPending
                    ? "Starting Trial..."
                    : "Start Free Trial"}
              </h3>
              <p className="text-sm text-gray-500">
                Try all features free for 7 days. No payment required.
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

                {/* Student Emails (for institutional/BODY purchases) */}
                {registrationData.isInstitutional && selectedPlanId && (
                  <div className="space-y-3 p-4 border-2 border-gray-200 rounded-xl">
                    <div>
                      <h4 className="text-sm font-semibold text-[#101828]">
                        Student Email Addresses
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Each student will receive a unique code that only they can redeem.
                      </p>
                    </div>
                    <div className="space-y-2">
                      {studentEmails.map((email, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              const updated = [...studentEmails];
                              updated[index] = e.target.value;
                              setStudentEmails(updated);
                            }}
                            placeholder={`Student ${index + 1} email`}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
                          />
                          {studentEmails.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setStudentEmails(studentEmails.filter((_, i) => i !== index))
                              }
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {studentEmails.length < registrationData.students && (
                      <button
                        type="button"
                        onClick={() => setStudentEmails([...studentEmails, ""])}
                        className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80"
                      >
                        <Plus className="h-3 w-3" />
                        Add Another Email
                      </button>
                    )}
                    <p className="text-[10px] text-gray-400">
                      {studentEmails.filter((e) => e.trim()).length} of {registrationData.students} emails entered
                    </p>
                  </div>
                )}

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
