import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/global/logo";
import PrimaryButton from "@/components/buttons/primary-button";
import { Alert } from "@/components/ui/alert";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useAuthStore } from "@/stores/authStore";
import { usePaymentPlans, useInitializePayment, useRedeemLicense, useStartTrial } from "@/feature/payment/hooks";
import { useExamSubjects } from "@/feature/exams/hooks";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { EXAM_SELECTION_ENDPOINTS } from "@/api/endpoints";
import { Check, Loader2, Upload, X, Pencil } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Max subjects allowed per exam type
function getMaxSubjects(examType: string): number {
  const normalized = examType.toLowerCase();
  if (normalized.includes("jamb") || normalized.includes("utme") || normalized.includes("post")) {
    return 4;
  }
  return 9;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { data: registrationData, reset: resetRegistration, setExamSelection } = useRegistrationStore();
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showLicenseInput, setShowLicenseInput] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [licenseCode, setLicenseCode] = useState("");
  const [trialStarted, setTrialStarted] = useState(false);
  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [studentEmails, setStudentEmails] = useState<string[]>([]);
  const [bulkEmailText, setBulkEmailText] = useState("");
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Edit subjects state
  const [showEditSubjects, setShowEditSubjects] = useState(false);
  const [editingSubjects, setEditingSubjects] = useState<string[]>(registrationData.subjects);

  useEffect(() => {
    return () => {
      if (navigationTimerRef.current) clearTimeout(navigationTimerRef.current);
    };
  }, []);

  // Use auth store user ID for Google OAuth users, registration store for normal flow
  const studentId = registrationData.studentId || authUser?.id;

  const examType = registrationData.examType;
  const examCategory = registrationData.category;
  const numberOfStudents = registrationData.isInstitutional ? registrationData.students : undefined;

  // Fetch available subjects for inline editing
  const { data: availableSubjects, isLoading: isLoadingSubjects } = useExamSubjects(examType);
  const maxSubjects = getMaxSubjects(examType);

  // Get subject labels from IDs
  const selectedSubjectLabels = registrationData.subjects
    .map((id) => availableSubjects?.find((s) => s.id === id)?.name)
    .filter(Boolean);

  // Save exam selection to backend after editing subjects
  const saveExamSelection = useMutation({
    mutationFn: async (subjects: string[]) => {
      await apiClient.post(EXAM_SELECTION_ENDPOINTS.SAVE, {
        examCategory: registrationData.category,
        examSubtype: registrationData.examType,
        examTypeId: registrationData.examTypeId,
        selectedSubjects: subjects,
      });
    },
  });

  const handleOpenEditSubjects = () => {
    setEditingSubjects(registrationData.subjects);
    setShowEditSubjects(true);
  };

  const handleSaveSubjects = () => {
    if (editingSubjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }
    // Update local store
    setExamSelection({
      examType: registrationData.examType,
      examTypeId: registrationData.examTypeId,
      duration: registrationData.duration,
      subjects: editingSubjects,
      students: registrationData.students,
    });
    // Persist to backend (user is authenticated after registration auto-login or Google OAuth)
    if (isAuthenticated) {
      saveExamSelection.mutate(editingSubjects, {
        onSuccess: () => {
          toast.success("Subjects updated");
        },
        onError: () => {
          toast.error("Failed to save subjects. Your changes are saved locally.");
        },
      });
    } else {
      toast.success("Subjects updated locally");
    }
    setShowEditSubjects(false);
  };

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
  const numberOfSelectedSubjects = registrationData.subjects.length;

  // Calculate total price accounting for FLEXIBLE vs FIXED plans
  const totalPrice = selectedPlan
    ? (() => {
        // Base: for FLEXIBLE plans, basePrice is per-subject
        const base = selectedPlan.category === "FLEXIBLE"
          ? selectedPlan.basePrice * Math.max(numberOfSelectedSubjects, 1)
          : selectedPlan.basePrice;
        // Institutional add-on
        const studentCost = numberOfStudents && selectedPlan.pricePerStudent
          ? numberOfStudents * selectedPlan.pricePerStudent
          : 0;
        return base + studentCost;
      })()
    : 0;

  const validateStudentEmails = (): boolean => {
    if (!registrationData.isInstitutional) return true;

    if (studentEmails.length !== registrationData.students) {
      toast.error(`Please add all ${registrationData.students} student emails (currently ${studentEmails.length})`);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (let i = 0; i < studentEmails.length; i++) {
      if (!emailRegex.test(studentEmails[i])) {
        toast.error(`Invalid email format: ${studentEmails[i]}`);
        return false;
      }
    }

    const unique = new Set(studentEmails);
    if (unique.size !== studentEmails.length) {
      toast.error("Each student must have a unique email address");
      return false;
    }

    return true;
  };

  const parseAndAddEmails = (raw: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const parts = raw.split(/[,;\n\r]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);

    const invalid: string[] = [];
    const valid: string[] = [];
    for (const part of parts) {
      if (emailRegex.test(part)) {
        valid.push(part);
      } else {
        invalid.push(part);
      }
    }

    if (invalid.length > 0) {
      toast.warning(`${invalid.length} invalid email${invalid.length > 1 ? "s" : ""} skipped`);
    }

    const existingSet = new Set(studentEmails);
    const duplicates: string[] = [];
    const newEmails: string[] = [];
    for (const email of valid) {
      if (existingSet.has(email) || newEmails.includes(email)) {
        duplicates.push(email);
      } else {
        newEmails.push(email);
      }
    }

    if (duplicates.length > 0) {
      toast.warning(`${duplicates.length} duplicate email${duplicates.length > 1 ? "s" : ""} skipped`);
    }

    const maxTotal = registrationData.students;
    const available = maxTotal - studentEmails.length;
    const toAdd = newEmails.slice(0, available);

    if (newEmails.length > available) {
      toast.warning(`Only ${available} more email${available !== 1 ? "s" : ""} can be added (max ${maxTotal})`);
    }

    if (toAdd.length > 0) {
      setStudentEmails((prev) => [...prev, ...toAdd]);
      toast.success(`${toAdd.length} email${toAdd.length > 1 ? "s" : ""} added`);
    }

    setBulkEmailText("");
    if (csvInputRef.current) csvInputRef.current.value = "";
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      // For CSV: extract first column from each row
      const emails = text
        .split(/\r?\n/)
        .map((line) => line.split(",")[0]?.trim())
        .filter(Boolean)
        .join("\n");
      parseAndAddEmails(emails);
    };
    reader.readAsText(file);
  };

  const handlePayNow = async () => {
    if (!selectedPlan || !studentId) {
      console.error("Missing required data for payment");
      return;
    }

    if (!validateStudentEmails()) return;

    try {
      // Save updated subjects to backend before payment
      if (isAuthenticated) {
        await saveExamSelection.mutateAsync(registrationData.subjects);
      }

      const callbackUrl = `${window.location.origin}/payment-verify?returnUrl=${encodeURIComponent("/checkout")}`;
      const trimmedEmails = registrationData.isInstitutional
        ? studentEmails.map((e) => e.trim().toLowerCase()).filter(Boolean)
        : undefined;

      const response = await initializePaymentMutation.mutateAsync({
        studentId: studentId!,
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
    if (!licenseCode || !studentId) return;

    try {
      // Save updated subjects to backend before redeeming
      if (isAuthenticated) {
        await saveExamSelection.mutateAsync(registrationData.subjects);
      }

      const response = await redeemLicenseMutation.mutateAsync({
        code: licenseCode,
        studentId: studentId!,
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
          navigate({ to: isAuthenticated ? "/" : "/sign-in" });
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
    if (!studentId) {
      toast.error("Missing student information. Please complete registration first.");
      return;
    }

    // For free trial, use the selected plan or first available
    const trialPlan = selectedPlanId ? plans?.find(p => p.id === selectedPlanId) : plans?.[0];
    if (!trialPlan) {
      toast.error("No plans available. Please try again shortly.");
      return;
    }

    try {
      // Save updated subjects to backend before starting trial
      if (isAuthenticated) {
        await saveExamSelection.mutateAsync(registrationData.subjects);
      }

      const response = await startTrialMutation.mutateAsync({
        studentId: studentId!,
        subscriptionId: trialPlan.id,
      });

      // Response might have success:true or just return trial data
      if (response && ((response as any).success || (response as any).trialEndDate || (response as any).id)) {
        setTrialStarted(true);
        toast.success("Free trial started!", {
          description: isAuthenticated
            ? "You now have access to all features."
            : "You can now sign in to access all features.",
        });
        // Wait a moment then navigate
        navigationTimerRef.current = setTimeout(() => {
          resetRegistration();
          navigate({ to: isAuthenticated ? "/" : "/sign-in" });
        }, 1500);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to start free trial. Please try again.";
      toast.error(message);
    }
  };

  const handleSkip = () => {
    navigate({ to: "/" });
  };

  if (!studentId) {
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

        {/* Current Selection Summary — with edit */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 uppercase font-medium">Your Selection</p>
            <button
              type="button"
              onClick={handleOpenEditSubjects}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
            >
              <Pencil className="h-3 w-3" />
              Edit Subjects
            </button>
          </div>
          <p className="text-sm font-semibold text-[#101828]">{examType}</p>
          <p className="text-xs text-gray-600">
            {selectedSubjectLabels.length > 0
              ? selectedSubjectLabels.join(", ")
              : `${registrationData.subjects.length} subject${registrationData.subjects.length !== 1 ? "s" : ""} selected`}
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
                Try all features for free, no payment required.
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
                    // FLEXIBLE: basePrice is per-subject, FIXED: basePrice is flat
                    const base = plan.category === "FLEXIBLE"
                      ? plan.basePrice * Math.max(numberOfSelectedSubjects, 1)
                      : plan.basePrice;
                    const studentCost = numberOfStudents && plan.pricePerStudent
                      ? numberOfStudents * plan.pricePerStudent
                      : 0;
                    const planTotal = base + studentCost;

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
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-[#101828]">{plan.name}</h4>
                              <span
                                className={cn(
                                  "text-[10px] font-medium px-1.5 py-0.5 rounded",
                                  isFlexible
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-blue-100 text-blue-700"
                                )}
                              >
                                {isFlexible ? "Per Subject" : "Fixed"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{plan.duration} days</p>
                            {plan.category === "FLEXIBLE" && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {plan.currency} {plan.basePrice.toLocaleString()}/subject &times; {numberOfSelectedSubjects}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-accent">
                              {plan.currency} {planTotal.toLocaleString()}
                            </div>
                            {plan.category === "FLEXIBLE" && (
                              <div className="text-[10px] text-gray-400">
                                Flexible
                              </div>
                            )}
                            {numberOfStudents && (
                              <div className="text-xs text-gray-500">
                                {plan.currency} {plan.basePrice.toLocaleString()} &times; {numberOfSubjects} subject{numberOfSubjects !== 1 ? "s" : ""}
                              </div>
                            )}
                            {numberOfStudents && plan.pricePerStudent && (
                              <div className="text-xs text-gray-500">
                                + {numberOfStudents} students
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

                    {/* Textarea for bulk paste */}
                    <div className="space-y-2">
                      <textarea
                        value={bulkEmailText}
                        onChange={(e) => setBulkEmailText(e.target.value)}
                        placeholder="Paste student emails here (one per line, or separated by commas)"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none resize-y"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => parseAndAddEmails(bulkEmailText)}
                          disabled={!bulkEmailText.trim()}
                          className="px-4 py-2 bg-accent text-white text-sm rounded-lg disabled:opacity-50 hover:bg-accent/80 transition-colors"
                        >
                          Add Emails
                        </button>
                        <input
                          ref={csvInputRef}
                          type="file"
                          accept=".csv,.txt"
                          onChange={handleCsvUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => csvInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-sm rounded-lg text-gray-700 hover:border-accent/50 transition-colors"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Upload CSV
                        </button>
                      </div>
                    </div>

                    {/* Counter and Clear All */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {studentEmails.length} of {registrationData.students} emails added
                      </p>
                      {studentEmails.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setStudentEmails([])}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Email chips */}
                    {studentEmails.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                        {studentEmails.map((email, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full"
                          >
                            {email}
                            <button
                              type="button"
                              onClick={() =>
                                setStudentEmails(studentEmails.filter((_, i) => i !== index))
                              }
                              className="hover:text-red-500 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedPlan && (
                  <div className="text-center text-sm text-gray-500">
                    {numberOfSubjects} subject{numberOfSubjects !== 1 ? "s" : ""} selected
                    {selectedPlan.category === "FLEXIBLE" && (
                      <> &middot; {selectedPlan.currency} {selectedPlan.basePrice.toLocaleString()}/subject</>
                    )}
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

      {/* Edit Subjects Dialog */}
      <Dialog open={showEditSubjects} onOpenChange={setShowEditSubjects}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Subjects</DialogTitle>
            <DialogDescription>
              Change your selected subjects for {examType}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isLoadingSubjects ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-gray-500 text-sm">Loading subjects...</span>
              </div>
            ) : availableSubjects && availableSubjects.length > 0 ? (
              <>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  Select your subjects (up to {maxSubjects})
                </p>
                <ToggleGroup
                  multiple
                  value={editingSubjects}
                  onValueChange={(value) => {
                    if (value.length <= maxSubjects) setEditingSubjects(value);
                  }}
                  className="flex flex-wrap gap-2 sm:gap-3"
                >
                  {availableSubjects.map((subject) => {
                    const isSelected = editingSubjects.includes(subject.id);
                    const atLimit = editingSubjects.length >= maxSubjects && !isSelected;
                    return (
                      <ToggleGroupItem
                        key={subject.id}
                        value={subject.id}
                        disabled={atLimit}
                        className={cn(
                          "h-auto py-3 sm:py-4 px-3 sm:px-4 rounded-sm! border-2",
                          "inline-flex items-center justify-center shrink-0",
                          "text-[11px] sm:text-xs font-medium text-center whitespace-nowrap",
                          "transition-all duration-200",
                          "hover:border-accent hover:bg-accent/5",
                          "data-[state=on]:border-accent/70 data-[state=on]:bg-transparent data-[state=on]:text-black",
                          isSelected ? "border-accent" : "border-[#E5E5E5] text-black",
                          atLimit && "opacity-50 cursor-not-allowed"
                        )}
                        aria-label={subject.name}
                      >
                        {subject.name}
                      </ToggleGroupItem>
                    );
                  })}
                </ToggleGroup>
                <div className="mt-3 text-xs text-[#6B7280]">
                  Selected: {editingSubjects.length}/{maxSubjects}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 py-4">
                No subjects available for this exam type
              </p>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => setShowEditSubjects(false)}
              className="px-4 py-2 text-sm font-medium rounded-4xl border border-border hover:bg-input/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSubjects}
              disabled={editingSubjects.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-4xl bg-accent text-white hover:bg-accent/80 transition-colors disabled:opacity-50"
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export const Route = createFileRoute("/_auth/checkout")({
  component: CheckoutPage,
});
