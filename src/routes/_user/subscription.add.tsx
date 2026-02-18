import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import CustomPageHeader from "@/components/global/custom-page-header";
import PrimaryButton from "@/components/buttons/primary-button";
import { CustomSelect } from "@/components/custom/custom-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Alert } from "@/components/ui/alert";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
} from "@/feature/payment/hooks";
import { useProfile } from "@/feature/profile/hooks/useProfile";
import { apiClient } from "@/api/client";
import { EXAM_SELECTION_ENDPOINTS } from "@/api/endpoints";
import { Loader2, ChevronRight, Check, ArrowLeft } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import * as z from "zod";

type Step = "category" | "exam-selection" | "checkout";

const examSelectionSchema = z.object({
  examType: z.string().min(1, "Please select an exam type"),
  subjects: z
    .array(z.string())
    .min(1, "Please select at least one subject")
    .max(9, "You can select maximum 9 subjects"),
  planId: z.string().min(1, "Please select a subscription plan"),
  numberOfStudents: z.array(z.number()),
});

const CATEGORY_EXAMPLES: Record<string, string> = {
  "primary": "e.g. Common Entrance",
  "o'level": "e.g. WAEC, NECO",
  "a'level": "e.g. IJMB, JUPEB",
  "post-jamb": "e.g. University Post-UTME",
  "university": "e.g. Course Exams",
  "professional": "e.g. ICAN, CIPM",
};

function getCategoryExample(label: string): string | undefined {
  const lower = label.toLowerCase();
  for (const [key, value] of Object.entries(CATEGORY_EXAMPLES)) {
    if (lower.includes(key)) return value;
  }
  return undefined;
}

function AddSubscriptionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useProfile();

  // UI state
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState("");
  const [examTypeId, setExamTypeId] = useState("");
  const [isInstitutional, setIsInstitutional] = useState(false);
  const [showLicenseInput, setShowLicenseInput] = useState(false);
  const [licenseCode, setLicenseCode] = useState("");

  // Track examType separately for hooks
  const [selectedExamType, setSelectedExamType] = useState("");

  // TanStack Form for step 2
  const form = useForm({
    defaultValues: {
      examType: "",
      subjects: [] as string[],
      planId: "",
      numberOfStudents: [4] as number[],
    },
    validators: {
      onSubmit: examSelectionSchema,
    },
    onSubmit: async () => {
      setStep("checkout");
    },
  });

  // Data hooks
  const { data: categories, isLoading: isLoadingCategories } =
    useExamCategories();
  const { data: examTypes, isLoading: isLoadingExamTypes } =
    useExamTypes(category);
  const { data: availableSubjects, isLoading: isLoadingSubjects } =
    useExamSubjects(selectedExamType);

  const subscriptionType = isInstitutional ? "BODY" : "INDIVIDUAL";
  const { data: plans, isLoading: isLoadingPlans } = usePaymentPlans(
    category,
    selectedExamType,
    subscriptionType,
  );

  // Save exam selection mutation
  const saveExamSelection = useMutation({
    mutationFn: async () => {
      const { subjects, planId } = form.state.values;
      await apiClient.post(EXAM_SELECTION_ENDPOINTS.SAVE, {
        examCategory: category,
        examSubtype: selectedExamType,
        examTypeId,
        selectedSubjects: subjects,
        subscriptionPlanId: planId,
      });
    },
  });

  // Payment hooks
  const initPayment = useInitializePayment();
  const redeemLicense = useRedeemLicense();
  const selectedPlan = plans?.find((p) => p.id === form.state.values.planId);
  const numberOfStudents = isInstitutional
    ? form.state.values.numberOfStudents[0]
    : 1;

  // Calculate total price for institutional
  const totalPrice = selectedPlan
    ? isInstitutional && selectedPlan.pricePerStudent
      ? selectedPlan.basePrice + numberOfStudents * selectedPlan.pricePerStudent
      : selectedPlan.basePrice
    : 0;

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
    setSelectedExamType("");
    setExamTypeId("");
    form.reset();
    setStep("exam-selection");
  };

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    queryClient.invalidateQueries({ queryKey: ["examPreferences"] });
    toast.success("Subscription added successfully!");
    setTimeout(() => {
      navigate({ to: "/subscription" });
    }, 500);
  };

  const handlePayNow = async () => {
    if (!selectedPlan || !user?.id) {
      toast.error(
        !selectedPlan
          ? "No plan selected"
          : "User not found — please log in again",
      );
      return;
    }
    const { subjects } = form.state.values;
    try {
      await saveExamSelection.mutateAsync();
      const callbackUrl = `${window.location.origin}/payment-verify?returnUrl=${encodeURIComponent("/subscription/add")}`;
      const response = await initPayment.mutateAsync({
        studentId: user.id,
        subscriptionId: selectedPlan.id,
        amount: totalPrice,
        subscriptionType: isInstitutional ? "BODY" : "INDIVIDUAL",
        numberOfSubjects: subjects.length,
        numberOfStudents,
        schoolType: category,
        examType: selectedExamType,
        numberOfDays: selectedPlan.duration,
        metadata: { callbackUrl },
      });

      // Get payment URL from response
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
    const { subjects } = form.state.values;
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
          description: "Your subscription has been activated.",
          duration: 4000,
        });
        setTimeout(() => onSuccess(), 500);
      }
    } catch {
      // error shown via mutation state
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

      <div className="max-w-2xl py-6 sm:py-8">
        {/* Back button within steps */}
        {step !== "category" && (
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 sm:mb-6"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories
                  .filter((c) => c.value !== "TUTORIAL")
                  .map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className="group relative flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-warning hover:bg-warning/5 transition-all duration-200 text-left"
                    >
                      <div className="pr-2">
                        <span className="text-sm font-medium text-[#101828]">
                          {cat.label}
                        </span>
                        {getCategoryExample(cat.label) && (
                          <span className="block text-xs text-gray-400 mt-0.5">
                            {getCategoryExample(cat.label)}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-warning shrink-0" />
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Exam Selection */}
        {step === "exam-selection" && (
          <form
            className="space-y-5 sm:space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            {/* Institutional Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white">
              <div>
                <p className="text-sm font-medium text-[#101828]">
                  Institutional Subscription
                </p>
                <p className="text-xs text-gray-500">
                  Subscribe for multiple students
                </p>
              </div>
              <Switch
                checked={isInstitutional}
                onCheckedChange={(checked) => {
                  setIsInstitutional(checked);
                  form.setFieldValue("planId", "");
                }}
              />
            </div>

            {/* Exam Type */}
            <form.Field
              name="examType"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="text-[#6D6D6D] uppercase text-[11px] sm:text-[12px] font-medium">
                      Exam Type
                    </FieldLabel>
                    {isLoadingExamTypes ? (
                      <div className="flex items-center gap-2 h-12 sm:h-14 px-4 border rounded-4xl">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-gray-500 text-sm">
                          Loading exam types...
                        </span>
                      </div>
                    ) : (
                      <CustomSelect
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value) => {
                          field.handleChange(value);
                          const selected = examTypes?.find(
                            (t) => t.name === value,
                          );
                          setSelectedExamType(value);
                          setExamTypeId(selected?.id || "");
                          form.setFieldValue("subjects", []);
                          form.setFieldValue("planId", "");
                        }}
                        options={examTypeOptions}
                        placeholder="Choose an exam type"
                        required
                      />
                    )}
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            {/* Subjects */}
            <form.Field
              name="subjects"
              mode="array"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="text-[#6D6D6D] uppercase text-[11px] sm:text-[12px] font-medium">
                      Subjects
                    </FieldLabel>
                    {!selectedExamType ? (
                      <p className="text-sm text-gray-500 py-4">
                        Please select an exam type first
                      </p>
                    ) : isLoadingSubjects ? (
                      <div className="flex items-center gap-2 py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-gray-500 text-sm">
                          Loading subjects...
                        </span>
                      </div>
                    ) : availableSubjects && availableSubjects.length > 0 ? (
                      <>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">
                          Please select your subjects (up to 9)
                        </p>
                        <ToggleGroup
                          multiple
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3"
                        >
                          {availableSubjects.map((subject) => (
                            <ToggleGroupItem
                              key={subject.id}
                              value={subject.id}
                              className={cn(
                                "h-auto py-3 sm:py-4 px-2 sm:px-3 rounded-sm! border-2",
                                "flex items-center justify-center",
                                "text-[11px] sm:text-xs font-medium text-center",
                                "transition-all duration-200",
                                "hover:border-accent hover:bg-accent/5",
                                "data-[state=on]:border-accent/70 data-[state=on]:bg-transparent data-[state=on]:text-black",
                                field.state.value.includes(subject.id)
                                  ? "border-accent"
                                  : "border-[#E5E5E5] text-black",
                              )}
                              aria-label={subject.name}
                            >
                              <span className="wrap-break-words text-center leading-tight">
                                {subject.name}
                              </span>
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                        {field.state.value.length > 0 && (
                          <div className="mt-3 text-xs text-[#6B7280]">
                            Selected: {field.state.value.length}/
                            {availableSubjects.length}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 py-4">
                        No subjects available for this exam type
                      </p>
                    )}
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            {/* Number of Students (Institutional) */}
            {isInstitutional && (
              <form.Field
                name="numberOfStudents"
                children={(field) => (
                  <Field>
                    <div className="flex items-center justify-between mb-2">
                      <FieldLabel className="text-[#6D6D6D] uppercase text-[11px] sm:text-[12px] font-medium">
                        Number of Students
                      </FieldLabel>
                      <span className="text-sm font-semibold text-accent">
                        {field.state.value[0]} Students
                      </span>
                    </div>
                    <Slider
                      min={2}
                      max={500}
                      step={1}
                      value={field.state.value}
                      onValueChange={(value) =>
                        field.handleChange(
                          Array.isArray(value) ? value : [value],
                        )
                      }
                      className="w-full"
                    />
                  </Field>
                )}
              />
            )}

            {/* Plan */}
            <form.Field
              name="planId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel className="text-[#6D6D6D] uppercase text-[11px] sm:text-[12px] font-medium">
                      Subscription Plan
                    </FieldLabel>
                    {!selectedExamType ? (
                      <p className="text-sm text-gray-500 py-4">
                        Please select an exam type first
                      </p>
                    ) : isLoadingPlans ? (
                      <div className="flex items-center gap-2 h-12 sm:h-14 px-4 border rounded-4xl">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-gray-500 text-sm">
                          Loading plans...
                        </span>
                      </div>
                    ) : durationOptions.length > 0 ? (
                      <CustomSelect
                        name={field.name}
                        value={field.state.value}
                        onValueChange={field.handleChange}
                        options={durationOptions}
                        placeholder="Choose a subscription plan"
                        required
                      />
                    ) : (
                      <p className="text-sm text-gray-500 py-4">
                        No plans available for this exam type
                      </p>
                    )}
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <PrimaryButton
              type="submit"
              disabled={form.state.isSubmitting || isLoadingExamTypes}
              className="w-full bg-accent hover:bg-accent/80 mt-4 text-white text-base sm:text-lg"
              title="Continue"
            />
          </form>
        )}

        {/* Step 3: Checkout */}
        {step === "checkout" && selectedPlan && (
          <div className="space-y-4">
            {/* Plan Card */}
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
                    {selectedExamType} &middot;{" "}
                    {form.state.values.subjects.length} subject
                    {form.state.values.subjects.length !== 1 ? "s" : ""}
                    {isInstitutional && ` · ${numberOfStudents} students`}
                  </p>
                  {isInstitutional && (
                    <span className="inline-block mt-2 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Institutional
                    </span>
                  )}
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
                  <p className="text-sm font-medium text-gray-700">Features:</p>
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
                    : `Pay ${selectedPlan.currency} ${totalPrice.toLocaleString()}`
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

export const Route = createFileRoute("/_user/subscription/add")({
  component: AddSubscriptionPage,
});
