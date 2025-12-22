import { createFileRoute } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import { SettingsSection } from "@/feature/settings/components/settings-section";

function SettingsPage() {
  return (
    <div className="">
      <CustomPageHeader
        backLink="/"
        search={false}
        heading="Profile"
        filter={true}
        subHeading="Pick a Subject and year"
      />
      <SettingsSection />
    </div>
  );
}

export const Route = createFileRoute("/_user/settings")({
  component: SettingsPage,
});
