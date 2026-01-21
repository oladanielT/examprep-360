import { AppSidebarContent, PageHeader } from "@/components/globals";
import { UsersStatsCards, UsersTable } from "@/features/users/components";
import React from "react";

const UsersPage = () => {
  return (
    <AppSidebarContent>
      <PageHeader
        name="loading..."
        desc="Track, manage and forecast your customers and orders."
        icon
      />
      <UsersStatsCards />
      <UsersTable />
    </AppSidebarContent>
  );
};

export default UsersPage;
