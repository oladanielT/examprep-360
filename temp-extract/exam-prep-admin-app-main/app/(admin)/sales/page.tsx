import { AppSidebarContent, PageHeader } from "@/components/globals";
import SalesStatsCards from "@/features/sales/components/sales-stats-card";
import SalesTable from "@/features/sales/components/sales-table";

const SalesPage = () => {
  return (
    <AppSidebarContent>
      <PageHeader
        name="loading..."
        desc="Track, manage and forecast your customers and orders."
      />
      <SalesStatsCards />
      <SalesTable />{" "}
    </AppSidebarContent>
  );
};

export default SalesPage;
