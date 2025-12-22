import React from "react";
import { Button } from "@/components/ui/button";
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
          <Button asChild variant="outline" size="sm">
            <Link to="/subscription">Manage</Link>
          </Button>
        </ItemActions>
      </Item>
    </section>
  );
};
