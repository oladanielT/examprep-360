import { createFileRoute } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import { SubscriptionSection } from "@/feature/subscription/subscription-section";

function SubscriptionIndexPage() {
  return (
    <div>
      <CustomPageHeader
        backLink="/settings"
        search={false}
        heading="Manage subscription"
        filter={false}
        subHeading="View, switch, or add subscriptions"
      />
      <SubscriptionSection />
    </div>
  );
}

export const Route = createFileRoute("/_user/subscription/")({
  component: SubscriptionIndexPage,
});
