import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/global/logo";
import { Progress } from "@/components/ui/progress";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useExamCategories } from "@/feature/exams/hooks";
import { Loader2, ChevronRight } from "lucide-react";

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

function Welcome() {
  const navigate = useNavigate();
  const { setUserType, setReferralCode } = useRegistrationStore();
  const { data: categories, isLoading, error } = useExamCategories();

  // Capture referral code from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref);
    }
  }, [setReferralCode]);

  const handleSelect = (category: { value: string; label: string }) => {
    const isUndergraduate =
      category.value === "UNIVERSITY_COURSE" ||
      category.label.toLowerCase().includes("university");

    // Save both userType and the actual category value for API calls
    setUserType(isUndergraduate ? "undergraduate" : "secondary", category.value);
    navigate({ to: "/register" });
  };

  return (
    <section className="space-y-6">
      <Progress value={25} />
      <Logo />

      <div className="mt-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-[#101828]">
            What are you preparing for?
          </h2>
          <p className="text-[#667085]">
            Select your exam category to get started
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-red-500">
            Failed to load categories. Please try again.
          </div>
        )}

        {categories && (
          <div className="grid md:grid-cols-2 gap-3">
            {categories
              .filter((category) => category.value !== "TUTORIAL")
              .map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => handleSelect(category)}
                className="group relative flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-warning hover:bg-warning/5 transition-all duration-200 text-left"
              >
                <div className="pr-2">
                  <span className="text-sm font-medium text-[#101828] group-hover:text-[#101828]">
                    {category.label}
                  </span>
                  {getCategoryExample(category.label) && (
                    <span className="block text-xs text-gray-400 mt-0.5">
                      {getCategoryExample(category.label)}
                    </span>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-warning shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export const Route = createFileRoute("/_auth/welcome")({
  component: Welcome,
});
