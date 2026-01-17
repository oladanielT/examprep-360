import { createFileRoute } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import { SubscriptionSection } from "@/feature/subscription/subscription-section";

function SubscriptionPage() {
  return (
    <div className="">
      <CustomPageHeader
        backLink="/settings"
        search={false}
        heading="Manage subscription"
        filter={true}
        subHeading="Pick a Subject and year"
      />
      <SubscriptionSection />
    </div>
  );
}

export const Route = createFileRoute("/_user/subscription")({
  component: SubscriptionPage,
});
