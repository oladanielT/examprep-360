import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Progress } from "@/components/ui/progress";
import { GoBack } from "@/components/global/go-back";
import { Logo } from "@/components/global/logo";
import PrimaryButton from "@/components/buttons/primary-button";
import { Alert } from "@/components/ui/alert";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useRegister } from "@/feature/auth/hooks";
import { useExamSubjects } from "@/feature/exams/hooks";
import { toast } from "sonner";

function SummaryPage() {
  const navigate = useNavigate();
  const { data, setStudentId } = useRegistrationStore();
  const registerMutation = useRegister();

  // Fetch subjects to get names
  const { data: subjects } = useExamSubjects(data.examType);

  // Get subject labels from IDs
  const selectedSubjectLabels = data.subjects
    .map((id) => subjects?.find((s) => s.id === id)?.name)
    .filter(Boolean);

  const handleSubmit = async () => {
    try {
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

      // Show success toast and navigate
      toast.success("Account created successfully!", {
        description: "Choose how you'd like to get started.",
        duration: 4000,
      });

      // Small delay to ensure toast is visible before navigation
      setTimeout(() => {
        navigate({ to: "/checkout" });
      }, 500);
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <section className="space-y-5">
      <Progress value={100} />
      <GoBack backTo="/select-exam" />
      <div className="flex flex-col gap-6 mt-5 max-w-md mx-auto">
        <Logo />

        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-3xl font-bold tracking-tight text-[#101828]">
            Review Your Information
          </h2>
          <p className="text-[#667085] text-sm md:text-base ">
            Please confirm your details before creating your account.
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Personal Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Account Type</span>
              <span className="font-medium capitalize">{data.userType || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Full Name</span>
              <span className="font-medium">{data.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{data.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium">{data.phone}</span>
            </div>
          </div>

          <h3 className="font-semibold text-lg border-b pb-2 pt-4">Exam Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Exam Type</span>
              <span className="font-medium uppercase">{data.examType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Subjects</span>
              <span className="font-medium text-right max-w-50">
                {selectedSubjectLabels.join(", ")}
              </span>
            </div>
          </div>

          {data.isInstitutional && (
            <>
              <h3 className="font-semibold text-lg border-b pb-2 pt-4">Institutional License</h3>
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

        {registerMutation.isError && (
          <Alert variant="destructive">
            {registerMutation.error?.response?.data?.message ||
              "Registration failed. Please try again."}
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-4">
          <PrimaryButton
            onClick={handleSubmit}
            disabled={registerMutation.isPending}
            className="w-full bg-accent hover:bg-accent/80 text-white text-lg disabled:opacity-50"
            title={registerMutation.isPending ? "Creating Account..." : "Create Account"}
          />
          <button
            type="button"
            onClick={() => navigate({ to: "/welcome" })}
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
