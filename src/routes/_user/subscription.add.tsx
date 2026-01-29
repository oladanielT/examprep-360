import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import PrimaryButton from "@/components/buttons/primary-button";
import { CustomSelect } from "@/components/custom/custom-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  useExamCategories,
  useExamTypes,
  useExamSubjects,
} from "@/feature/exams/hooks";
import {
  usePaymentPlans,
  useInitializePayment,
  useRedeemLicense,
  useStartTrial,
} from "@/feature/payment/hooks";
import { useProfile } from "@/feature/profile/hooks/useProfile";
import { apiClient } from "@/api/client";
import { EXAM_SELECTION_ENDPOINTS } from "@/api/endpoints";
import { Loader2, ChevronRight, Check, ArrowLeft } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

type Step = "category" | "exam-selection" | "checkout";

function AddSubscriptionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useProfile();

  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState("");
  const [examType, setExamType] = useState("");
  const [examTypeId, setExamTypeId] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [planId, setPlanId] = useState("");
  const [showLicenseInput, setShowLicenseInput] = useState(false);
  const [licenseCode, setLicenseCode] = useState("");

  // Data hooks
  const { data: categories, isLoading: isLoadingCategories } =
    useExamCategories();
  const { data: examTypes, isLoading: isLoadingExamTypes } =
    useExamTypes(category);
  const { data: availableSubjects, isLoading: isLoadingSubjects } =
    useExamSubjects(examType);
  const { data: plans, isLoading: isLoadingPlans } = usePaymentPlans(
    category,
    examType
  );

  // Save exam selection mutation
  const saveExamSelection = useMutation({
    mutationFn: async () => {
      await apiClient.post(EXAM_SELECTION_ENDPOINTS.SAVE, {
        examCategory: category,
        examSubtype: examType,
        examTypeId,
        selectedSubjects: subjects,
        subscriptionPlanId: planId,
      });
    },
  });

  // Payment hooks
  const initPayment = useInitializePayment();
  const redeemLicense = useRedeemLicense();
  const startTrial = useStartTrial();

  const selectedPlan = plans?.find((p) => p.id === planId);

  const durationOptions =
    plans?.map((plan) => ({
      label: `${plan.name} - ${plan.duration} Days (${plan.currency} ${plan.basePrice.toLocaleString()})`,
      value: plan.id,
    })) || [];

  const examTypeOptions =
    examTypes?.map((type) => ({
      label: type.name,
      value: type.name,
    })) || [];

  const handleCategorySelect = (cat: { value: string }) => {
    setCategory(cat.value);
    setExamType("");
    setExamTypeId("");
    setSubjects([]);
    setPlanId("");
    setStep("exam-selection");
  };

  const handleExamSelectionSubmit = () => {
    if (!examType || subjects.length === 0 || !planId) return;
    setStep("checkout");
  };

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    toast.success("Subscription added");
    navigate({ to: "/subscription" });
  };

  const handlePayNow = async () => {
    if (!selectedPlan || !user?.id) {
      toast.error(
        !selectedPlan
          ? "No plan selected"
          : "User not found — please log in again"
      );
      return;
    }
    try {
      await saveExamSelection.mutateAsync();
      const callbackUrl = `${window.location.origin}/payment-verify`;
      const response = await initPayment.mutateAsync({
        studentId: user.id,
        subscriptionId: selectedPlan.id,
        amount: selectedPlan.basePrice,
        subscriptionType: "INDIVIDUAL",
        numberOfSubjects: subjects.length,
        numberOfStudents: 1,
        schoolType: category,
        examType: examType,
        numberOfDays: selectedPlan.duration,
        metadata: { callbackUrl },
      });
      if (response.authorizationUrl) {
        window.location.href = response.authorizationUrl;
      }
    } catch {
      // error shown via mutation state
    }
  };

  const handleRedeemLicense = async () => {
    if (!licenseCode) return;
    try {
      await saveExamSelection.mutateAsync();
      const response = await redeemLicense.mutateAsync({ licenseCode });
      if (response.success) onSuccess();
    } catch {
      // error shown via mutation state
    }
  };

  const handleStartTrial = async () => {
    if (!selectedPlan || !user?.id) {
      toast.error(
        !selectedPlan
          ? "No plan selected"
          : "User not found — please log in again"
      );
      return;
    }
    try {
      await saveExamSelection.mutateAsync();
      const response = await startTrial.mutateAsync({
        studentId: user.id,
        subscriptionId: selectedPlan.id,
      });
      if (response.success) onSuccess();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to start trial"
      );
    }
  };

  const handleBack = () => {
    if (step === "checkout") setStep("exam-selection");
    else if (step === "exam-selection") {
      setStep("category");
      setCategory("");
    } else navigate({ to: "/subscription" });
  };

  return (
    <div>
      <CustomPageHeader
        backLink="/subscription"
        search={false}
        heading="Add Subscription"
        filter={false}
        subHeading={
          step === "category"
            ? "What are you preparing for?"
            : step === "exam-selection"
              ? "Select your exam and subjects"
              : "Complete your subscription"
        }
      />

      <div className="max-w-2xl py-8">
        {/* Back button within steps */}
        {step !== "category" && (
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        {/* Step 1: Category */}
        {step === "category" && (
          <div className="space-y-4">
            {isLoadingCategories && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            )}
            {categories && (
              <div className="grid grid-cols-2 gap-3">
                {categories
                  .filter((c) => c.value !== "TUTORIAL")
                  .map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className="group relative flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-warning hover:bg-warning/5 transition-all duration-200 text-left"
                    >
                      <span className="text-sm font-medium text-[#101828] pr-2">
                        {cat.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-warning flex-shrink-0" />
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Exam Selection */}
        {step === "exam-selection" && (
          <div className="space-y-6">
            {/* Exam Type */}
            <div className="space-y-2">
              <label className="text-[#6D6D6D] uppercase text-[12px] font-medium">
                Exam Type
              </label>
              {isLoadingExamTypes ? (
                <div className="flex items-center gap-2 h-14 px-4 border rounded-4xl">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-gray-500">Loading exam types...</span>
                </div>
              ) : (
                <CustomSelect
                  name="examType"
                  value={examType}
                  onValueChange={(value) => {
                    setExamType(value);
                    const selected = examTypes?.find((t) => t.name === value);
                    setExamTypeId(selected?.id || "");
                    setSubjects([]);
                    setPlanId("");
                  }}
                  options={examTypeOptions}
                  placeholder="Choose an exam type"
                  required
                />
              )}
            </div>

            {/* Subjects */}
            <div className="space-y-2">
              <label className="text-[#6D6D6D] uppercase text-[12px] font-medium">
                Subjects
              </label>
              {!examType ? (
                <p className="text-sm text-gray-500 py-4">
                  Please select an exam type first
                </p>
              ) : isLoadingSubjects ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-gray-500">Loading subjects...</span>
                </div>
              ) : availableSubjects && availableSubjects.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    Please select your subjects (up to 9)
                  </p>
                  <ToggleGroup
                    multiple
                    value={subjects}
                    onValueChange={setSubjects}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
                  >
                    {availableSubjects.map((subject) => (
                      <ToggleGroupItem
                        key={subject.id}
                        value={subject.id}
                        className={cn(
                          "h-auto py-4 px-3 !rounded-sm border-2",
                          "flex items-center justify-center",
                          "text-xs font-medium text-center",
                          "transition-all duration-200",
                          "hover:border-accent hover:bg-accent/5",
                          "data-[state=on]:border-accent/70 data-[state=on]:bg-transparent data-[state=on]:text-black",
                          subjects.includes(subject.id)
                            ? "border-accent"
                            : "border-[#E5E5E5] text-black"
                        )}
                        aria-label={subject.name}
                      >
                        <span className="whitespace-nowrap">{subject.name}</span>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  {subjects.length > 0 && (
                    <div className="mt-3 text-xs text-[#6B7280]">
                      Selected: {subjects.length}/{availableSubjects.length}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 py-4">
                  No subjects available for this exam type
                </p>
              )}
            </div>

            {/* Plan */}
            <div className="space-y-2">
              <label className="text-[#6D6D6D] uppercase text-[12px] font-medium">
                Subscription Plan
              </label>
              {!examType ? (
                <p className="text-sm text-gray-500 py-4">
                  Please select an exam type first
                </p>
              ) : isLoadingPlans ? (
                <div className="flex items-center gap-2 h-14 px-4 border rounded-4xl">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-gray-500">Loading plans...</span>
                </div>
              ) : durationOptions.length > 0 ? (
                <CustomSelect
                  name="plan"
                  value={planId}
                  onValueChange={setPlanId}
                  options={durationOptions}
                  placeholder="Choose a subscription plan"
                  required
                />
              ) : (
                <p className="text-sm text-gray-500 py-4">
                  No plans available for this exam type
                </p>
              )}
            </div>

            <PrimaryButton
              type="button"
              onClick={handleExamSelectionSubmit}
              disabled={!examType || subjects.length === 0 || !planId}
              className="w-full bg-accent hover:bg-accent/80 mt-4 text-white text-lg"
              title="Continue"
            />
          </div>
        )}

        {/* Step 3: Checkout */}
        {step === "checkout" && selectedPlan && (
          <div className="space-y-4">
            {/* Plan Card */}
            <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl p-6 border-2 border-accent/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#101828]">
                    {selectedPlan.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedPlan.description}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {examType} &middot; {subjects.length} subject
                    {subjects.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-accent">
                    {selectedPlan.currency}{" "}
                    {selectedPlan.basePrice.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
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
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 text-accent" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
            {startTrial.isError && (
              <Alert variant="destructive">
                {startTrial.error?.response?.data?.message ||
                  "Failed to start trial."}
              </Alert>
            )}

            <div className="space-y-3">
              <PrimaryButton
                onClick={handlePayNow}
                disabled={initPayment.isPending}
                className="w-full bg-accent hover:bg-accent/80 text-white text-lg"
                title={initPayment.isPending ? "Processing..." : "Pay Now"}
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
                        disabled={!licenseCode || redeemLicense.isPending}
                        className="flex-1 py-2 px-4 bg-accent text-white rounded-xl disabled:opacity-50"
                      >
                        {redeemLicense.isPending ? "Redeeming..." : "Redeem"}
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

              <button
                onClick={handleStartTrial}
                disabled={startTrial.isPending}
                className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-accent/50 transition-colors disabled:opacity-50"
              >
                {startTrial.isPending
                  ? "Starting Trial..."
                  : "Start Free Trial"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_user/subscription/add")({
  component: AddSubscriptionPage,
});
