import { createFileRoute } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import Competition from "@/feature/home/components/competition";
import Continue from "@/feature/home/components/continue";
import Stat from "@/feature/home/components/stat";
import FreeTrialBanner from "@/feature/home/components/free-trial-banner";
import PhonePromptModal from "@/feature/home/components/phone-prompt-modal";
import { useProfile } from "@/feature/profile/hooks/useProfile";
import { useAuthStore } from "@/stores/authStore";

function HomePage() {
  const { user: authUser } = useAuthStore();
  const { data: profileUser } = useProfile();
  const user = profileUser || authUser;

  const firstName = user?.fullName?.split(" ")[0] || "there";

  return (
    <div className="">
      <CustomPageHeader
        heading={`Welcome back, ${firstName}`}
        subHeading="Pick up quickly from where you left off"
      />
      <Stat />
      <FreeTrialBanner />
      <Continue />
      <Competition />
      <PhonePromptModal />
    </div>
  );
}

export const Route = createFileRoute("/_user/")({
  component: HomePage,
});
