import { AppSidebarContent, PageHeader } from "@/components/globals";
import MockTable from "@/features/mock/components/mock-table";

const MockPage = () => {
  return (
    <AppSidebarContent>
      <PageHeader
        name="loading..."
        desc="Track, manage and forecast your customers and orders."
      />
      <MockTable />
    </AppSidebarContent>
  );
};

export default MockPage;
