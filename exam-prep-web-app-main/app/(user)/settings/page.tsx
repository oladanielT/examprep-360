import CustomPageHeader from "@/components/global/custom-page-header";
import { SettingsSection } from "@/feature/settings/components/settings-section";
import { paths } from "@/paths";

export default function Page() {
  return (
    <div className="">
      <CustomPageHeader
        backLink={paths.app.root.getHref()}
        search={false}
        heading="Profile"
        filter={true}
        subHeading="Pick a Subject and year"
      />
      <SettingsSection />
    </div>
  );
}
