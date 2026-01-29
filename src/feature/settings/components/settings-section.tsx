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
import { useSubscriptions } from "@/feature/subscription/hooks/useSubscription";

export const SettingsSection = () => {
  const { data: subscriptions } = useSubscriptions();
  const count = subscriptions?.length ?? 0;

  return (
    <section className="py-6 sm:py-10 flex flex-col lg:flex-row gap-8 lg:gap-16 xl:gap-20">
      {/* Avatar — centered on mobile, top-left on desktop */}
      <div className="flex flex-col items-center lg:items-start">
        <AvatarUpload />
      </div>

      {/* Form */}
      <div className="flex-1 min-w-0">
        <ProfileSettingsForm />
      </div>

      {/* Subscription card */}
      <div className="w-full lg:w-auto lg:shrink-0">
        <Item className="h-fit bg-[#FFF0B333]">
          <ItemContent>
            <ItemTitle>Manage Subscriptions</ItemTitle>
            <ItemDescription>
              {count} Subscription{count !== 1 ? "s" : ""}
            </ItemDescription>
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
      </div>
    </section>
  );
};
