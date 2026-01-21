import { AppSidebarContent, PageHeader } from "@/components/globals";
import InstitutionStatsCards from "@/features/institutions/components/institution-stats-card";
import InstitutionTable from "@/features/institutions/components/institution-table";

const InstitutionPage = () => {
  return (
    <AppSidebarContent>
      <PageHeader
        name="Higher Institutions"
        desc="Manage universities, colleges, polytechnics, faculties and departments."
      />
      <InstitutionStatsCards />
      <InstitutionTable />
    </AppSidebarContent>
  );
};

export default InstitutionPage;
