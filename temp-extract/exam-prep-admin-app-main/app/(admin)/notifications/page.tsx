import PrimaryButton from "@/components/buttons/primary-button";
import { CustomTabs } from "@/components/custom/custom-tab";
import { AppSidebarContent } from "@/components/globals";
import { Card } from "@/components/ui/card";
import InApp from "@/features/notifications/components/in-app";

const NotificationsPage = () => {
  return (
    <AppSidebarContent>
      <Card className=" max-w-5xl p-9 space-y-5">
        <h5 className="  font-bold text-lg">Notifications</h5>
        <CustomTabs
          tabs={[
            {
              value: "inApp",
              label: "In App Notifications",
              content: <InApp />,
            },
            {
              value: "emailNotification",
              label: "Email Notification",
              content: <InApp />,
            },
          ]}
        />
      </Card>
    </AppSidebarContent>
  );
};

export default NotificationsPage;
