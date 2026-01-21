import { AppSidebarContent, PageHeader } from "@/components/globals";
import {
  HomeBarChart,
  HomePieChart,
  HomeRadialChart,
  HomeStatsCard,
  HomeStatsSmallCard,
  HomeTable,
  NewSignUp,
} from "@/features/home/components";

export default function Home() {
  return (
    <AppSidebarContent>
      <PageHeader
        name="loading..."
        desc="Track, manage and forecast your customers and orders."
        icon
      />
      <HomeStatsCard />
      <HomeStatsSmallCard />
      <div className="grid grid-cols-3 mt-10 gap-4">
        <HomePieChart />
        <HomeBarChart />
      </div>
      <HomeTable />
      <div className="grid grid-cols-3 mt-10 gap-4">
        <NewSignUp />
        <HomeRadialChart />
      </div>
    </AppSidebarContent>
  );
}
