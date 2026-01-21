import { AppSidebar } from "@/components/globals";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminGuard } from "@/components/guards";
import React from "react";

const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AdminGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-sidebar pt-8 pl-10">{children}</SidebarInset>
      </SidebarProvider>
    </AdminGuard>
  );
};

export default SidebarLayout;
