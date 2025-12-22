import CustomPageHeader from "@/components/global/custom-page-header";
import { SubscriptionSection } from "@/feature/subscription/subscription-section";
import { paths } from "@/paths";

export default function Page() {
  return (
    <div className="">
      <CustomPageHeader
        backLink={paths.app.subscription.getHref()}
        search={false}
        heading="Manage subscription"
        filter={true}
        subHeading="Pick a Subject and year"
      />
      <SubscriptionSection />
    </div>
  );
}
