import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import CustomPageHeader from "@/components/global/custom-page-header";
import PrimaryButton from "@/components/buttons/primary-button";
import { CustomSelect } from "@/components/custom/custom-select";
import { SubjectPicker } from "@/components/subject-picker";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Alert } from "@/components/ui/alert";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  useExamCategories,
  useExamSubjects,
  useExamTypes,
  useProfessionalHierarchy,
} from "@/feature/exams/hooks/useExams";
import {
  usePaymentPlans,
  useInitializePayment,
  useRedeemLicense,
} from "@/feature/payment/hooks";
import { useProfile } from "@/feature/profile/hooks/useProfile";
import { apiClient } from "@/api/client";
import { EXAM_SELECTION_ENDPOINTS } from "@/api/endpoints";
import { Loader2, ChevronRight, Check, ArrowLeft, Lock } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Step = "category" | "exam-selection" | "checkout";

// Max subjects allowed per exam type (matches registration flow)
function getMaxSubjects(examType: string): number {
  const normalized = examType.toLowerCase();
  // Post-UTME: students pick a single subject. Checked before JAMB/UTME
  // since "Post-UTME" also matches "utme".
  if (normalized.includes("post")) {
    return 1;
  }
  if (normalized.includes("jamb") || normalized.includes("utme")) {
    return 4;
  }
  return 9; // WAEC, NECO, etc.
}

// O'Level / Secondary School, Post-JAMB, and Professional are available for now (matches registration flow)
function isCategoryUnlocked(label: string): boolean {
  const lower = label.toLowerCase();
  return (
    lower.includes("o'level") ||
    lower.includes("o' level") ||
    lower.includes("secondary") ||
    lower.includes("post-jamb") ||
    lower.includes("post jamb") ||
    lower.includes("post-utme") ||
    lower.includes("post utme") ||
    lower.includes("professional")
  );
}

// We will inline the schema to support dynamic category validation

const CATEGORY_EXAMPLES: Record<string, string> = {
  "primary": "e.g. Common Entrance",
  "o'level": "e.g. WAEC, NECO",
  "a'level": "e.g. IJMB, JUPEB",
  "post-jamb": "e.g. University Post-UTME",
  "university": "e.g. Course Exams",
  "professional": "e.g. NMCN, ICAN, CIPM",
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
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [lockedCategory, setLockedCategory] = useState("");

  // Track examType separately for hooks
  const [selectedExamType, setSelectedExamType] = useState("");

  const isProfessional = category === "PROFESSIONAL_EXAMS" || category === "PROFESSIONAL";

  // TanStack Form for step 2
  const form = useForm({
    defaultValues: {
      examType: "",
      subjects: [] as string[],
      planId: "",
      numberOfStudents: [4] as number[],
    },
    validators: {
      onSubmit: z.object({
        examType: z.string().min(1, "Please select an exam type"),
        subjects: z.array(z.string()),
        planId: z.string().min(1, "Please select a subscription plan"),
        numberOfStudents: z.array(z.number()),
      }).refine((data) => {
        if (!isProfessional && data.subjects.length === 0) {
          return false;
        }
        return true;
      }, { message: "Please select at least one subject", path: ["subjects"] }),
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
  const { data: professionalHierarchy, isLoading: isLoadingHierarchy } =
    useProfessionalHierarchy(isProfessional ? selectedExamType : "");

  const subscriptionType = isInstitutional ? "BODY" : "INDIVIDUAL";
  const { data: plans, isLoading: isLoadingPlans } = usePaymentPlans({
    schoolType: category,
    examType: selectedExamType,
    examTypeId,
    subscriptionType,
  });

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
  const numberOfSubjects = form.state.values.subjects.length;

  // Calculate total price accounting for FLEXIBLE vs FIXED plans
  const calculatePlanPrice = (plan: NonNullable<typeof selectedPlan>, numSubjects: number, numStudents: number) => {
    // Base: for FLEXIBLE plans, basePrice is per-subject
    const base = plan.category === "FLEXIBLE"
      ? plan.basePrice * Math.max(numSubjects, 1)
      : plan.basePrice;
    // Institutional add-on
    const studentCost = isInstitutional && plan.pricePerStudent
      ? numStudents * plan.pricePerStudent
      : 0;
    return base + studentCost;
  };

  const totalPrice = selectedPlan
    ? calculatePlanPrice(selectedPlan, numberOfSubjects, numberOfStudents)
    : 0;

  const durationOptions =
    plans?.map((plan) => {
      const displayPrice = plan.category === "FLEXIBLE"
        ? `${plan.currency} ${plan.basePrice.toLocaleString()}/subject`
        : `${plan.currency} ${plan.basePrice.toLocaleString()}`;
      return {
        // Price first so the amount stays visible when the select trigger
        // truncates a long plan name.
        label: `${displayPrice} · ${plan.duration} days · ${plan.name}`,
        value: plan.id,
      };
    }) || [];

  const examTypeOptions =
    examTypes?.map((type) => ({
      label: type.label || type.name || type.value || "",
      value: type.name || type.value || type.label || "",
    })) || [];

  const handleCategorySelect = (cat: { value: string; label: string }) => {
    if (!isCategoryUnlocked(cat.label)) {
      setLockedCategory(cat.label);
      setShowComingSoon(true);
      return;
    }
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
        numberOfSubjects: isProfessional ? 1 : subjects.length,
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-[88px] rounded-xl" />
                ))}
              </div>
            )}
            {categories && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories
                  .filter((c) => c.value !== "TUTORIAL")
                  .map((cat) => {
                    const unlocked = isCategoryUnlocked(cat.label);
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => handleCategorySelect(cat)}
                        className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-left ${
                          unlocked
                            ? "border-gray-200 bg-white hover:border-warning hover:bg-warning/5"
                            : "border-gray-200 bg-gray-50 cursor-pointer"
                        }`}
                      >
                        <div className="pr-2">
                          <span className={`text-sm font-medium ${unlocked ? "text-[#101828]" : "text-gray-400"}`}>
                            {cat.label}
                          </span>
                          {getCategoryExample(cat.label) && (
                            <span className="block text-xs text-gray-400 mt-0.5">
                              {getCategoryExample(cat.label)}
                            </span>
                          )}
                        </div>
                        {unlocked ? (
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-warning shrink-0" />
                        ) : (
                          <Lock className="h-4 w-4 text-gray-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
              </div>
            )}

            {/* Coming Soon Modal */}
            <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-lg">Coming Soon!</DialogTitle>
                  <DialogDescription className="text-gray-600 mt-2">
                    <strong>{lockedCategory}</strong> exams are not yet available on Exampreps-360.
                    We're working hard to bring them to you soon. Stay tuned for updates!
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose
                    render={
                      <Button className="w-full bg-accent hover:bg-accent/80 text-white" />
                    }
                  >
                    Got it
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                      <Skeleton className="h-12 sm:h-14 w-full rounded-4xl" />
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

            {/* Subjects - Hidden for Professional Exams since they unlock full components */}
            {!isProfessional ? (
              <form.Field
                name="subjects"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  const maxSubjects = getMaxSubjects(selectedExamType);
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
                        <div className="flex flex-wrap gap-2 py-4">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="h-10 w-24 rounded-full" />
                          ))}
                        </div>
                      ) : availableSubjects && availableSubjects.length > 0 ? (
                        <>
                          <p className="text-xs sm:text-sm text-gray-600 mb-3">
                            Please select your subjects (up to {maxSubjects})
                          </p>
                          <SubjectPicker
                            subjects={availableSubjects}
                            value={field.state.value}
                            onChange={field.handleChange}
                            maxSubjects={maxSubjects}
                            className="gap-2 sm:gap-3"
                          />
                          {field.state.value.length > 0 && (
                            <div className="mt-3 text-xs text-[#6B7280]">
                              Selected: {field.state.value.length}/{maxSubjects}
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
            ) : (
              selectedExamType && (
                <div className="space-y-3">
                  <FieldLabel className="text-[#6D6D6D] uppercase text-[11px] sm:text-[12px] font-medium">
                    Exam Structure Preview
                  </FieldLabel>
                  <p className="text-xs sm:text-sm text-gray-600">
                    A subscription unlocks full access to all tracks and components.
                  </p>
                  
                  {isLoadingHierarchy ? (
                    <div className="space-y-4 py-4 pr-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <div className="pl-3 border-l-2 border-gray-200 space-y-2">
                            {[1, 2].map((j) => (
                              <Skeleton key={j} className="h-12 w-full rounded-lg" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : professionalHierarchy?.professionalTracks?.length ? (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                      {professionalHierarchy.professionalTracks.map((track) => (
                        <div key={track.id} className="space-y-2">
                          <h4 className="font-semibold text-sm text-gray-800">{track.name}</h4>
                          <div className="grid grid-cols-1 gap-2 pl-3 border-l-2 border-gray-200">
                            {track.components.map((comp) => (
                              <div key={comp.id} className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 text-xs">
                                <div className="font-medium text-gray-900 flex justify-between items-center mb-1">
                                  <span>{comp.name}</span>
                                  <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                                    {comp.kind.replace("_", " ")}
                                  </span>
                                </div>
                                {comp.domains && comp.domains.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1.5" aria-label={`${comp.domains.length} domains covered`}>
                                    {comp.domains.map((domain, index) => {
                                      const domainStyles = [
                                        "bg-amber-50 text-amber-700 border-amber-200",
                                        "bg-sky-50 text-sky-700 border-sky-200",
                                        "bg-emerald-50 text-emerald-700 border-emerald-200",
                                        "bg-rose-50 text-rose-700 border-rose-200",
                                      ];

                                      return (
                                        <span
                                          key={domain.id}
                                          className={`inline-flex max-w-full items-center rounded-full border px-2 py-1 text-[10px] font-medium leading-tight ${domainStyles[index % domainStyles.length]}`}
                                          title={domain.name}
                                        >
                                          {domain.name}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 py-4">
                      No structure found.
                    </p>
                  )}
                </div>
              )
            )}

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
                      <Skeleton className="h-12 sm:h-14 w-full rounded-4xl" />
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
                  {selectedPlan.category === "FLEXIBLE" && (
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedPlan.currency} {selectedPlan.basePrice.toLocaleString()} &times; {numberOfSubjects} subject{numberOfSubjects !== 1 ? "s" : ""}
                      {isInstitutional && selectedPlan.pricePerStudent
                        ? ` + ${selectedPlan.currency} ${(numberOfStudents * selectedPlan.pricePerStudent).toLocaleString()} (students)`
                        : ""}
                    </p>
                  )}
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
