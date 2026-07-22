import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/global/logo";
import PrimaryButton from "@/components/buttons/primary-button";
import { Alert } from "@/components/ui/alert";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useAuthStore } from "@/stores/authStore";
import { usePaymentPlans, useInitializePayment, useRedeemLicense, useValidatePromo } from "@/feature/payment/hooks";
import { useWalletBalance } from "@/feature/wallet/hooks";
import { useExamSubjects } from "@/feature/exams/hooks";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { EXAM_SELECTION_ENDPOINTS } from "@/api/endpoints";
import { Check, Loader2, Upload, X, Pencil, Wallet, Tag } from "lucide-react";
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
import { SubjectPicker } from "@/components/subject-picker";

// Max subjects allowed per exam type
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
  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [studentEmails, setStudentEmails] = useState<string[]>([]);
  const [bulkEmailText, setBulkEmailText] = useState("");
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");

  // Wallet state
  const [useWallet, setUseWallet] = useState(false);

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
  const numberOfSubjects = registrationData.subjects?.length || 1;

  // Fetch available subjects for inline editing
  const { data: availableSubjects, isLoading: isLoadingSubjects } = useExamSubjects(examType);
  const maxSubjects = getMaxSubjects(examType);

  // Wallet balance
  const { data: walletData } = useWalletBalance();
  const walletBalance = walletData?.balance ?? 0;

  // Promo code validation
  const { data: promoResult, isFetching: isValidatingPromo } = useValidatePromo(
    appliedPromo,
    selectedPlanId ?? ""
  );

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

  // Find the selected plan
  const selectedPlan = plans?.find((p) => p.id === selectedPlanId);

  // Calculate total price based on plan category
  const calcPlanTotal = (plan: NonNullable<typeof plans>[number]) => {
    const base = plan.category === "FLEXIBLE"
      ? plan.basePrice * numberOfSubjects
      : plan.basePrice;
    if (numberOfStudents && plan.pricePerStudent) {
      return base + (numberOfStudents * plan.pricePerStudent);
    }
    return base;
  };

  const baseTotalPrice = selectedPlan ? calcPlanTotal(selectedPlan) : 0;

  // Apply promo discount
  const promoValid = !!promoResult?.promo?.isActive;
  const promoDiscount = promoValid
    ? promoResult!.discountInfo
      ? promoResult!.discountInfo.discountAmount
      : promoResult!.promo!.discountType === "PERCENTAGE"
        ? Math.round((baseTotalPrice * promoResult!.promo!.discountValue) / 100)
        : promoResult!.promo!.discountValue
    : 0;
  const priceAfterPromo = Math.max(0, baseTotalPrice - promoDiscount);

  // Apply wallet deduction
  const walletDeduction = useWallet ? Math.min(walletBalance, priceAfterPromo) : 0;
  const totalPrice = priceAfterPromo - walletDeduction;

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
      toast.warning(`${invalid.length} invalid email${invalid.length > 1 ? `s` : ``} skipped`);
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
      toast.warning(`${duplicates.length} duplicate email${duplicates.length > 1 ? `s` : ``} skipped`);
    }

    const maxTotal = registrationData.students;
    const available = maxTotal - studentEmails.length;
    const toAdd = newEmails.slice(0, available);

    if (newEmails.length > available) {
      toast.warning(`Only ${available} more email${available !== 1 ? `s` : ``} can be added (max ${maxTotal})`);
    }

    if (toAdd.length > 0) {
      setStudentEmails((prev) => [...prev, ...toAdd]);
      toast.success(`${toAdd.length} email${toAdd.length > 1 ? `s` : ``} added`);
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

      const callbackUrl = `${window.location.origin}/payment-verify?returnUrl=${encodeURIComponent(`/checkout`)}`;
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
        ...(appliedPromo && promoValid && { promoCode: appliedPromo }),
        ...(useWallet && { useWallet: true }),
        metadata: {
          callbackUrl,
        },
      });

      const paymentUrl = (response as any).paymentUrl;
      const accessCode = (response as any).accessCode;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else if (accessCode) {
        window.location.href = `https://checkout.paystack.com/${accessCode}`;
      } else if (totalPrice === 0 || (response as any).paid) {
        // Wallet covered the full amount — no external payment needed
        toast.success("Payment successful!", {
          description: "Your subscription has been activated.",
        });
        navigationTimerRef.current = setTimeout(() => {
          resetRegistration();
          navigate({ to: "/" });
        }, 1000);
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

      if (response && ((response as any).id || (response as any).success)) {
        toast.success("License code redeemed!", {
          description: "Your subscription has been activated.",
          duration: 4000,
        });
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
          <div className="space-y-4">
            {isLoadingPlans ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : plans && plans.length > 0 ? (
              <>
                <div className="space-y-3">
                  {plans.map((plan) => {
                    const isFlexible = plan.category === "FLEXIBLE";
                    const planTotal = calcPlanTotal(plan);

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
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-accent">
                              {plan.currency} {planTotal.toLocaleString()}
                            </div>
                            {isFlexible && (
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

                {/* Promo Code Section */}
                {selectedPlanId && (
                  <div className="p-4 border-2 border-gray-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Tag className="h-4 w-4" />
                      Promo Code
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-accent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (appliedPromo === promoCode) return;
                          setAppliedPromo(promoCode);
                        }}
                        disabled={!promoCode || promoCode.length < 3 || isValidatingPromo}
                        className="px-4 py-2 bg-accent text-white text-sm rounded-lg disabled:opacity-50 hover:bg-accent/80 transition-colors"
                      >
                        {isValidatingPromo ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                      {appliedPromo && (
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedPromo("");
                            setPromoCode("");
                          }}
                          className="px-2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {appliedPromo && promoResult && (
                      <p className={cn(
                        "text-xs",
                        promoValid ? "text-green-600" : "text-red-500"
                      )}>
                        {promoValid
                          ? `Discount applied: -${selectedPlan?.currency ?? "NGN"} ${promoDiscount.toLocaleString()}`
                          : promoResult.message || "Invalid promo code"}
                      </p>
                    )}
                  </div>
                )}

                {/* Wallet Payment Toggle */}
                {selectedPlanId && walletBalance > 0 && (
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-accent/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(e) => setUseWallet(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                    />
                    <Wallet className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">
                        Use wallet balance
                      </p>
                      <p className="text-xs text-gray-500">
                        Available: NGN {walletBalance.toLocaleString()}
                      </p>
                    </div>
                    {useWallet && walletDeduction > 0 && (
                      <span className="text-sm font-medium text-green-600">
                        -NGN {walletDeduction.toLocaleString()}
                      </span>
                    )}
                  </label>
                )}

                {/* Price Breakdown */}
                {selectedPlan && (promoDiscount > 0 || walletDeduction > 0) && (
                  <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span>{selectedPlan.currency} {baseTotalPrice.toLocaleString()}</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Promo discount</span>
                        <span>-{selectedPlan.currency} {promoDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    {walletDeduction > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Wallet</span>
                        <span>-{selectedPlan.currency} {walletDeduction.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
                      <span>Total</span>
                      <span>{selectedPlan.currency} {totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {selectedPlan && !(promoDiscount > 0 || walletDeduction > 0) && (
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
                        ? totalPrice > 0
                          ? `Pay ${selectedPlan.currency} ${totalPrice.toLocaleString()}`
                          : "Activate Now"
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
                <SubjectPicker
                  subjects={availableSubjects}
                  value={editingSubjects}
                  onChange={setEditingSubjects}
                  maxSubjects={maxSubjects}
                  className="gap-2 sm:gap-3"
                />
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
