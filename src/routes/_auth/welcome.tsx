import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/global/logo";
import { Progress } from "@/components/ui/progress";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useAuthStore } from "@/stores/authStore";
import { useExamCategories } from "@/feature/exams/hooks";
import { Loader2, ChevronRight, Lock } from "lucide-react";
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

// O'Level / Secondary School and Post-JAMB are available for now
function isCategoryUnlocked(label: string): boolean {
  const lower = label.toLowerCase();
  return (
    lower.includes("o'level") ||
    lower.includes("o' level") ||
    lower.includes("secondary") ||
    lower.includes("post-jamb") ||
    lower.includes("post jamb") ||
    lower.includes("post-utme") ||
    lower.includes("post utme")
  );
}

function Welcome() {
  const navigate = useNavigate();
  const { setUserType, setReferralCode } = useRegistrationStore();
  const { data: categories, isLoading, error } = useExamCategories();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [lockedCategory, setLockedCategory] = useState("");

  // Capture referral code from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref);
    }
  }, [setReferralCode]);

  const { isAuthenticated } = useAuthStore();

  const handleSelect = (category: { value: string; label: string }) => {
    if (!isCategoryUnlocked(category.label)) {
      setLockedCategory(category.label);
      setShowComingSoon(true);
      return;
    }

    const isUndergraduate =
      category.value === "UNIVERSITY_COURSE" ||
      category.label.toLowerCase().includes("university");

    // Save both userType and the actual category value for API calls
    setUserType(isUndergraduate ? "undergraduate" : "secondary", category.value);

    // If user is already authenticated (e.g. Google OAuth), skip registration form
    if (isAuthenticated) {
      navigate({ to: "/select-exam" });
    } else {
      navigate({ to: "/register" });
    }
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
              .map((category) => {
                const unlocked = isCategoryUnlocked(category.label);
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => handleSelect(category)}
                    className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-left ${
                      unlocked
                        ? "border-gray-200 bg-white hover:border-warning hover:bg-warning/5"
                        : "border-gray-200 bg-gray-50 cursor-pointer"
                    }`}
                  >
                    <div className="pr-2">
                      <span className={`text-sm font-medium ${unlocked ? "text-[#101828]" : "text-gray-400"}`}>
                        {category.label}
                      </span>
                      {getCategoryExample(category.label) && (
                        <span className="block text-xs text-gray-400 mt-0.5">
                          {getCategoryExample(category.label)}
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
    </section>
  );
}

export const Route = createFileRoute("/_auth/welcome")({
  component: Welcome,
});
