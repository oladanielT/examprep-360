import DangerButton from "@/components/buttons/danger-button";
import { AppSidebarContent } from "@/components/globals";
import { SuspendUserDialog } from "@/features/users/components";
import UsersDetail from "@/features/users/components/users-detail";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { paths } from "@/config/paths";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;

  return (
    <AppSidebarContent>
      <div className=" flex items-center justify-between ">
        <Link
          href={paths.app.users.getHref()}
          className=" font-medium flex items-center gap-2"
        >
          <ArrowLeft className=" h-5" /> Back
        </Link>
        <SuspendUserDialog>
          <DangerButton title="Suspend User" className=" w-40" />
        </SuspendUserDialog>
      </div>
      <UsersDetail userId={id} />
    </AppSidebarContent>
  );
};

export default Page;
