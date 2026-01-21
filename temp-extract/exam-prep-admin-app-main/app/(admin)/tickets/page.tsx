import { AppSidebarContent, PageHeader } from "@/components/globals";
import TicketsTable from "@/features/tickets/components/tickets-table";

const TicketsPage = () => {
  return (
    <AppSidebarContent>
      <PageHeader
        name="loading..."
        desc="Track, manage and forecast your customers and orders."
      />
      <TicketsTable />
    </AppSidebarContent>
  );
};

export default TicketsPage;
