import { CustomTabs } from "@/components/custom/custom-tab";
import CustomCard from "@/components/global/custom-card";
import CustomPageHeader from "@/components/global/custom-page-header";
import { Card } from "@/components/ui/card";
import Completed from "@/feature/activities/components/completed";
import Paused from "@/feature/activities/components/paused";
import Reported from "@/feature/activities/components/reported";
import { EmptyStat } from "@/feature/home/components/stat";
import { paths } from "@/paths";
import Image from "next/image";

export default function Page() {
  return (
    <div className="">
      <CustomPageHeader
        backLink={paths.app.root.getHref()}
        search={false}
        heading="Activities"
        filter={true}
        subHeading="Your Activities"
      />

      <CustomTabs
        listClassName="flex-col py-5    rounded-2xl shadow-lg bg-[#FFF8F9]  max-w-60 border-none! h-full gap-0 items-start"
        triggerClassName="data-[state=active]:border-l-4  px-5 data-[state=active]:text-black data-[state=active]:bg-transparent text-gray-400 text-left py-3 border-b-0 data-[state=active]:border-[#F04F54] h-auto text-lg "
        className="w-full!  flex-row gap-20  py-10 justify-center   space-y-0     h-full! "
        tabs={[
          {
            value: "Paused Exams",
            label: "Paused Exams",
            content: <Paused />,
          },
          {
            value: "Completed Exams",
            label: "Completed Exams",
            content: <Completed />,
          },
          {
            value: "Bookmarked Questions",
            label: "Bookmarked Questions",
            content: <Paused />,
          },
          {
            value: "Reported Questions",
            label: "Reported Questions",
            content: <Reported />,
          },
        ]}
      />
    </div>
  );
}
