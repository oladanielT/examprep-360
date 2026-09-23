import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";
import { GoBack } from "@/components/global/go-back";
import { Logo } from "@/components/global/logo";
import PrimaryButton from "@/components/buttons/primary-button";
import { Alert } from "@/components/ui/alert";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useRegister, useLogin } from "@/feature/auth/hooks";
import { useExamSubjects, useProfessionalHierarchy } from "@/feature/exams/hooks";
import { useValidateReferral } from "@/feature/referral/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { EXAM_SELECTION_ENDPOINTS } from "@/api/endpoints";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, Gift } from "lucide-react";
import { isProfessionalExam } from "@/lib/exam-category";

type ReferralValidationStatus = "idle" | "checking" | "valid" | "invalid";

function SummaryPage() {
  const navigate = useNavigate();
  const { data, setStudentId, setReferralCode } = useRegistrationStore();
  const registerMutation = useRegister();
  const loginMutation = useLogin();
  const validateReferral = useValidateReferral();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  // Referral code field. Pre-filled from registrationStore if welcome.tsx
  // captured one off the ?ref= URL param. Expanded automatically when
  // there's already a value; collapsed behind a link otherwise.
  const [codeInput, setCodeInput] = useState<string>(data.referralCode || "");
  const [refExpanded, setRefExpanded] = useState<boolean>(!!data.referralCode);
  const [refStatus, setRefStatus] = useState<ReferralValidationStatus>("idle");
  const [refMessage, setRefMessage] = useState<string>("");

  // Validate a code against the backend. Empty input resets to idle.
  const runValidation = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
      setRefStatus("idle");
      setRefMessage("");
      return true;
    }
    setRefStatus("checking");
    setRefMessage("");
    try {
      const res = await validateReferral.mutateAsync({
        referralCode: trimmed,
      });
      if (res.valid) {
        setRefStatus("valid");
        setRefMessage(res.message || "Looks good — code applied.");
        return true;
      }
      setRefStatus("invalid");
      setRefMessage(res.message || "This code isn't recognised.");
      return false;
    } catch {
      // Swallow backend specifics (often an array of NestJS validator
      // messages) and show a single friendly line. Real cause shows up
      // in the network tab if we need to debug.
      setRefStatus("invalid");
      setRefMessage(
        "That code doesn't look right. Double-check and try again.",
      );
      return false;
    }
  };

  // Auto-validate any pre-filled (URL-captured) code on mount so the user
  // sees ✓/✗ before they even touch the field.
  useEffect(() => {
    if (data.referralCode) {
      void runValidation(data.referralCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefChange = (value: string) => {
    setCodeInput(value);
    setReferralCode(value); // keep the store in sync for handleSubmit
    setRefStatus("idle"); // reset until the next blur/submit validation
    setRefMessage("");
  };

  // Save exam selection for already-authenticated users (Google OAuth)
  const saveExamSelection = useMutation({
    mutationFn: async () => {
      await apiClient.post(EXAM_SELECTION_ENDPOINTS.SAVE, {
        examCategory: data.category,
        examSubtype: data.examType,
        examTypeId: data.examTypeId,
        selectedSubjects: data.subjects,
      });
    },
  });

  // Fetch subjects to get names
  const isProfessional = isProfessionalExam(data.category);
  const { data: professionalHierarchy } = useProfessionalHierarchy(isProfessional ? data.examTypeId : "");
  const { data: subjects } = useExamSubjects(isProfessional ? "" : data.examType);

  // Get subject labels from IDs
  const selectedSubjectLabels = isProfessional
    ? (professionalHierarchy?.professionalTracks
        .flatMap((track) => track.components)
        .flatMap((comp) => comp.domains)
        .filter((domain) => data.subjects.includes(domain.id))
        .map((domain) => domain.name) || [])
    : data.subjects
        .map((id) => subjects?.find((s) => s.id === id)?.name)
        .filter(Boolean);

  const examTypeName = isProfessional ? (professionalHierarchy?.name || data.examType) : data.examType;

  const handleSubmit = async () => {
    // If a code is in the field, make sure it's been validated as valid
    // before we let the registration go through. Empty code is allowed.
    if (codeInput.trim()) {
      if (refStatus !== "valid") {
        const ok = await runValidation(codeInput);
        if (!ok) return;
      }
    }
    try {
      if (isAuthenticated) {
        // Google OAuth user — already registered, just save exam selection
        await saveExamSelection.mutateAsync();

        toast.success("Exam selection saved!", {
          description: "Choose how you'd like to get started.",
          duration: 4000,
        });

        setTimeout(() => {
          navigate({ to: "/checkout" });
        }, 500);
      } else {
        // Normal registration flow
        const response = await registerMutation.mutateAsync({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          password: data.password,
          examType: data.examType,
          examTypeId: data.examTypeId,
          examCategory: data.category,
          selectedSubjects: data.subjects,
          ...(data.isInstitutional && { numberOfStudents: data.students }),
          ...(data.referralCode && { referralCode: data.referralCode }),
        });

        // Save student ID from response
        if (response.student?.id) {
          setStudentId(response.student.id);
        }

        // Auto-login so the user is authenticated on checkout
        // (allows saving exam selection edits, etc.)
        try {
          await loginMutation.mutateAsync({
            email: data.email,
            password: data.password,
          });
        } catch {
          // Login may fail (e.g. email not verified yet) — continue without auth
        }

        // Show success toast and navigate
        toast.success("Account created successfully!", {
          description: "Choose how you'd like to get started.",
          duration: 4000,
        });

        // Small delay to ensure toast is visible before navigation
        setTimeout(() => {
          navigate({ to: "/checkout" });
        }, 500);
      }
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <section className="space-y-5">
      <Progress value={100} />
      <div className="relative flex h-16 w-full items-center px-4">
        <GoBack backTo="/welcome" />

        <div className="absolute left-1/2 -translate-x-1/2">
          <Logo />
        </div>
      </div>
      <div className="flex flex-col gap-6 mt-5 max-w-md mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-3xl font-bold tracking-tight text-[#101828]">
            Review Your Information
          </h2>
          <p className="text-[#667085] text-sm md:text-base ">
            Please confirm your details before creating your account.
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-gray-50 rounded-xl px-6 py-4 space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Personal Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Account Type</span>
              <span className="font-medium capitalize">
                {data.userType || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Full Name</span>
              <span className="font-medium">
                {isAuthenticated ? user?.fullName : data.fullName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">
                {isAuthenticated ? user?.email : data.email}
              </span>
            </div>
            {!isAuthenticated && (
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium">{data.phone}</span>
              </div>
            )}
          </div>

          <h3 className="font-semibold text-lg border-b pb-2 pt-4">
            Exam Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Exam Type</span>
              <span className="font-medium uppercase">{examTypeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{isProfessional ? "Topics/Sections" : "Subjects"}</span>
              <span className="font-medium text-right max-w-50">
                {selectedSubjectLabels.join(", ")}
              </span>
            </div>
          </div>

          {data.isInstitutional && (
            <>
              <h3 className="font-semibold text-lg border-b pb-2 pt-4">
                Institutional License
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">License Type</span>
                  <span className="font-medium">Institutional</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Number of Students</span>
                  <span className="font-medium">{data.students}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Referral code (only for the non-authenticated registration flow —
            Google OAuth users already have an account). */}
        {!isAuthenticated && (
          <div className="bg-gray-50 rounded-xl p-5 space-y-3">
            {!refExpanded ? (
              <button
                type="button"
                onClick={() => setRefExpanded(true)}
                className="text-sm text-accent hover:underline flex items-center gap-1.5"
              >
                <Gift className="w-4 h-4" />
                Have a referral code?
              </button>
            ) : (
              <>
                <label
                  htmlFor="referral-code"
                  className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
                >
                  <Gift className="w-4 h-4 text-accent" />
                  Referral Code
                  <span className="text-xs font-normal text-gray-400">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="referral-code"
                    type="text"
                    value={codeInput}
                    onChange={(e) =>
                      handleRefChange(e.target.value.toUpperCase())
                    }
                    onBlur={() => void runValidation(codeInput)}
                    placeholder="e.g. A44SNX9V"
                    autoComplete="off"
                    className={`w-full h-11 pl-3 pr-10 rounded-lg border bg-white font-mono tracking-wider text-sm focus:outline-none focus:ring-2 ${
                      refStatus === "invalid"
                        ? "border-red-300 focus:ring-red-200"
                        : refStatus === "valid"
                          ? "border-emerald-300 focus:ring-emerald-200"
                          : "border-gray-200 focus:ring-accent/30"
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {refStatus === "checking" && (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    )}
                    {refStatus === "valid" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                    {refStatus === "invalid" && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                {refMessage && refStatus !== "idle" && (
                  <div
                    className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                      refStatus === "invalid"
                        ? "bg-red-50 text-red-700 border border-red-100"
                        : refStatus === "valid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-gray-50 text-gray-600 border border-gray-100"
                    }`}
                  >
                    {refStatus === "valid" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    ) : refStatus === "invalid" ? (
                      <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    ) : null}
                    <span className="leading-snug">{refMessage}</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {registerMutation.isError && (
          <Alert variant="destructive">
            {registerMutation.error?.response?.data?.message ||
              "Registration failed. Please try again."}
          </Alert>
        )}

        {saveExamSelection.isError && (
          <Alert variant="destructive">
            Failed to save exam selection. Please try again.
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-4">
          <PrimaryButton
            onClick={handleSubmit}
            disabled={
              registerMutation.isPending ||
              saveExamSelection.isPending ||
              refStatus === "checking" ||
              (codeInput.trim().length > 0 && refStatus === "invalid")
            }
            className="w-full bg-accent hover:bg-accent/80 text-white text-lg disabled:opacity-50"
            title={
              registerMutation.isPending || saveExamSelection.isPending
                ? "Processing..."
                : refStatus === "checking"
                  ? "Checking code..."
                  : isAuthenticated
                    ? "Continue"
                    : "Create Account"
            }
          />
          <button
            type="button"
            onClick={() =>
              navigate({ to: isAuthenticated ? "/select-exam" : "/welcome" })
            }
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Edit Information
          </button>
        </div>
      </div>
    </section>
  );
}

export const Route = createFileRoute("/_auth/summary")({
  component: SummaryPage,
});
