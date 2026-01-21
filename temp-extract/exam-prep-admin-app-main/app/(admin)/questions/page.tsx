import { AppSidebarContent, PageHeader } from "@/components/globals";
import QuestionSelects from "@/features/questions/components/question-selects";
import QuestionStatsCards from "@/features/questions/components/question-stats-card";
import QuestionTable from "@/features/questions/components/question-table";

const QuestionPage = () => {
  return (
    <AppSidebarContent>
      <PageHeader
        name="loading..."
        desc="Track, manage and forecast your customers and orders."
      />
      <QuestionStatsCards />
      <QuestionSelects />
      <QuestionTable />
    </AppSidebarContent>
  );
};

export default QuestionPage;
