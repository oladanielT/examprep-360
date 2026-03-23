import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import PrimaryButton from "@/components/buttons/primary-button";
import { CustomSelect } from "@/components/custom/custom-select";
import { Alert } from "@/components/ui/alert";
import { Field, FieldLabel } from "@/components/ui/field";
import { useExamPreferences, useExamSubjects } from "@/feature/exams/hooks";
import {
  usePaymentPlans,
  useInitializePayment,
  useRedeemLicense,
} from "@/feature/payment/hooks";
import { useProfile } from "@/feature/profile/hooks/useProfile";
import { apiClient } from "@/api/client";
import { EXAM_SELECTION_ENDPOINTS } from "@/api/endpoints";
import { Loader2, Check, ArrowLeft, Crown } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type UpgradeSearch = {
  examType: string;
  examTypeId: string;
  subjects: string;
  subscriptionId: string;
};

function UpgradeSubscriptionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useProfile();
  const search = Route.useSearch();

  const examType = search.examType || "";
  const examTypeId = search.examTypeId || "";
  const subjects = search.subjects ? search.subjects.split(",") : [];

  // Category comes from exam preferences (subscription was switched to focus before navigating here)
  const { data: preferences, isLoading: isLoadingPrefs } = useExamPreferences();
  const category = preferences?.examCategory || "";

  // Fetch subjects for displaying names
  const { data: availableSubjects } = useExamSubjects(examType);

  // Plan selection state
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [showLicenseInput, setShowLicenseInput] = useState(false);
  const [licenseCode, setLicenseCode] = useState("");

  // Fetch plans using category from preferences
  const { data: plans, isLoading: isLoadingPlans } = usePaymentPlans(
    category,
    examType,
    "INDIVIDUAL"
  );

  const selectedPlan = plans?.find((p) => p.id === selectedPlanId);
  const totalPrice = selectedPlan?.basePrice || 0;

  const durationOptions =
    plans?.map((plan) => ({
      label: `${plan.name} - ${plan.duration} Days (${plan.currency} ${plan.basePrice.toLocaleString()})`,
      value: plan.id,
    })) || [];

  // Get subject names
  const subjectNames =
    availableSubjects
      ?.filter((s) => subjects.includes(s.id))
      .map((s) => s.name) || [];

  // Save exam selection mutation
  const saveExamSelection = useMutation({
    mutationFn: async () => {
      await apiClient.post(EXAM_SELECTION_ENDPOINTS.SAVE, {
        examCategory: category,
        examSubtype: examType,
        examTypeId,
        selectedSubjects: subjects,
        subscriptionPlanId: selectedPlanId,
      });
    },
  });

  const initPayment = useInitializePayment();
  const redeemLicense = useRedeemLicense();

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    queryClient.invalidateQueries({ queryKey: ["examPreferences"] });
    toast.success("Subscription upgraded successfully!");
    setTimeout(() => {
      navigate({ to: "/subscription" });
    }, 500);
  };

  const handlePayNow = async () => {
    if (!selectedPlan || !user?.id) {
      toast.error(
        !selectedPlan
          ? "Please select a plan"
          : "User not found — please log in again"
      );
      return;
    }
    try {
      await saveExamSelection.mutateAsync();
      const callbackUrl = `${window.location.origin}/payment-verify?returnUrl=${encodeURIComponent("/subscription")}`;
      const response = await initPayment.mutateAsync({
        studentId: user.id,
        subscriptionId: selectedPlan.id,
        amount: totalPrice,
        subscriptionType: "INDIVIDUAL",
        numberOfSubjects: subjects.length,
        numberOfStudents: 1,
        schoolType: category,
        examType,
        numberOfDays: selectedPlan.duration,
        metadata: { callbackUrl },
      });

      const paymentUrl = (response as any).paymentUrl;
      const accessCode = (response as any).accessCode;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else if (accessCode) {
        window.location.href = `https://checkout.paystack.com/${accessCode}`;
      } else {
        toast.error("Payment initialization failed", {
          description: "Could not get payment URL. Please try again.",
        });
      }
    } catch {
      // error shown via mutation state
    }
  };

  const handleRedeemLicense = async () => {
    if (!licenseCode || !user?.id) return;
    try {
      await saveExamSelection.mutateAsync();
      const response = await redeemLicense.mutateAsync({
        code: licenseCode,
        studentId: user.id,
        subjects,
        courses: [],
      });
      if (response && ((response as any).id || (response as any).success)) {
        toast.success("License code redeemed!", {
          description: "Your subscription has been upgraded.",
          duration: 4000,
        });
        setTimeout(() => onSuccess(), 500);
      }
    } catch {
      // error shown via mutation state
    }
  };

  const isLoading = isLoadingPrefs || (!category && !isLoadingPrefs);

  return (
    <div>
      <CustomPageHeader
        backLink="/subscription"
        search={false}
        heading="Upgrade Subscription"
        filter={false}
        subHeading="Upgrade your free trial to a paid plan"
      />

      <div className="max-w-2xl py-6 sm:py-8">
        <button
          onClick={() => navigate({ to: "/subscription" })}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Current Subscription Summary */}
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 sm:p-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-semibold text-gray-900">
              Upgrading: {examType}
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            {subjectNames.length > 0
              ? subjectNames.join(", ")
              : `${subjects.length} subject${subjects.length !== 1 ? "s" : ""}`}
          </p>
          <p className="text-xs text-amber-600 font-medium mt-2">
            Currently on Free Trial
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : !selectedPlanId ? (
          /* Plan Selection */
          <div className="space-y-5">
            <Field>
              <FieldLabel className="text-[#6D6D6D] uppercase text-[11px] sm:text-[12px] font-medium">
                Choose a Plan
              </FieldLabel>
              {isLoadingPlans ? (
                <div className="flex items-center gap-2 h-12 sm:h-14 px-4 border rounded-4xl">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-gray-500 text-sm">Loading plans...</span>
                </div>
              ) : durationOptions.length > 0 ? (
                <CustomSelect
                  name="planId"
                  value={selectedPlanId}
                  onValueChange={setSelectedPlanId}
                  options={durationOptions}
                  placeholder="Choose a subscription plan"
                  required
                />
              ) : (
                <p className="text-sm text-gray-500 py-4">
                  No plans available for this exam type
                </p>
              )}
            </Field>
          </div>
        ) : (
          /* Checkout */
          <div className="space-y-4">
            {/* Plan Card */}
            {selectedPlan && (
              <div className="bg-linear-to-br from-accent/5 to-accent/10 rounded-xl p-4 sm:p-6 border-2 border-accent/20">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-[#101828]">
                      {selectedPlan.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {selectedPlan.description}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {examType} &middot; {subjects.length} subject
                      {subjects.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <div className="text-2xl sm:text-3xl font-bold text-accent">
                      {selectedPlan.currency} {totalPrice.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      for {selectedPlan.duration} days
                    </div>
                  </div>
                </div>

                {selectedPlan.features && selectedPlan.features.length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700">
                      Features:
                    </p>
                    {selectedPlan.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs sm:text-sm"
                      >
                        <Check className="h-4 w-4 text-accent shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {saveExamSelection.isError && (
              <Alert variant="destructive">
                Failed to save exam selection. Please try again.
              </Alert>
            )}
            {initPayment.isError && (
              <Alert variant="destructive">
                {initPayment.error?.response?.data?.message ||
                  "Failed to initialize payment. Please try again."}
              </Alert>
            )}
            {redeemLicense.isError && (
              <Alert variant="destructive">
                {redeemLicense.error?.response?.data?.message ||
                  "Failed to redeem license code."}
              </Alert>
            )}

            <div className="space-y-3">
              <PrimaryButton
                onClick={handlePayNow}
                disabled={initPayment.isPending || saveExamSelection.isPending}
                className="w-full bg-accent hover:bg-accent/80 text-white text-base sm:text-lg"
                title={
                  initPayment.isPending || saveExamSelection.isPending
                    ? "Processing..."
                    : `Pay ${selectedPlan?.currency} ${totalPrice.toLocaleString()}`
                }
              />

              {/* Change Plan */}
              <button
                onClick={() => setSelectedPlanId("")}
                className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-accent/50 transition-colors"
              >
                Change Plan
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
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={licenseCode}
                      onChange={(e) => setLicenseCode(e.target.value)}
                      placeholder="Enter license code"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleRedeemLicense}
                        disabled={!licenseCode || redeemLicense.isPending}
                        className="flex-1 py-2.5 px-4 bg-accent text-white rounded-xl disabled:opacity-50 text-sm font-medium"
                      >
                        {redeemLicense.isPending ? "Redeeming..." : "Redeem"}
                      </button>
                      <button
                        onClick={() => {
                          setShowLicenseInput(false);
                          setLicenseCode("");
                        }}
                        className="px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_user/subscription/upgrade")({
  component: UpgradeSubscriptionPage,
  validateSearch: (search: Record<string, unknown>): UpgradeSearch => ({
    examType: (search.examType as string) || "",
    examTypeId: (search.examTypeId as string) || "",
    subjects: (search.subjects as string) || "",
    subscriptionId: (search.subscriptionId as string) || "",
  }),
});
