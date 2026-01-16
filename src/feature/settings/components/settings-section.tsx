import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import AvatarUpload from "./avatar-upload";
import { ProfileSettingsForm } from "./profile-detail";
import { Link } from "@tanstack/react-router";

export const SettingsSection = () => {
  return (
    <section className="py-10 flex gap-20">
      <AvatarUpload />
      <ProfileSettingsForm />
      <Item className="h-fit bg-[#FFF0B333]">
        <ItemContent>
          <ItemTitle>Manage Subscriptions</ItemTitle>
          <ItemDescription>6 Subscriptions</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Link
            to="/subscription"
            className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-4xl border border-border bg-input/30 hover:bg-input/50 transition-colors"
          >
            Manage
          </Link>
        </ItemActions>
      </Item>
    </section>
  );
};
