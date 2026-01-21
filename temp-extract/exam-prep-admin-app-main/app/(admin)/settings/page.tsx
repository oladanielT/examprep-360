import { CustomTabs } from "@/components/custom/custom-tab";
import { AppSidebarContent } from "@/components/globals";
import { Card } from "@/components/ui/card";
import Activity from "@/features/settings/components/activity";
import Administrators from "@/features/settings/components/administrators";
import Profile from "@/features/settings/components/profile";
import Security from "@/features/settings/components/security";

const SettingsPage = () => {
  return (
    <AppSidebarContent>
      <Card className="w-full p-9 space-y-5">
        <h5 className="font-bold text-lg">Account</h5>
        <CustomTabs
          tabs={[
            {
              value: "profile",
              label: "Profile",
              content: <Profile />,
            },
            {
              value: "security",
              label: "Security",
              content: <Security />,
            },
            {
              value: "administrators",
              label: "Administrators",
              content: <Administrators />,
            },
            {
              value: "activity",
              label: "Activity Log",
              content: <Activity />,
            },
          ]}
        />
      </Card>
    </AppSidebarContent>
  );
};

export default SettingsPage;
