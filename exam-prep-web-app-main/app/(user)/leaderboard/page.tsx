import CustomPageHeader from "@/components/global/custom-page-header";
import { Card } from "@/components/ui/card";
import { EmptyStat } from "@/feature/home/components/stat";
import { paths } from "@/paths";
import Image from "next/image";

export default function Page() {
  return (
    <div className="">
      <CustomPageHeader
        backLink={paths.app.root.getHref()}
        search={false}
        heading="Leadership"
        filter={true}
        subHeading="See your position in contrast to others"
      />
      <div className=" flex items-center py-10 gap-20">
        <div className=" space-y-5 max-w-80  gap-5 ">
          <Image
            src={"/svg/competition.svg"}
            alt="leaderboard"
            className="w-72 h-44"
            width={1000}
            height={1000}
          />
          <p className=" text-lg font-medium ">
            You placed 4th this week, you can do better this week! Keep pushing!
          </p>
          <EmptyStat />
        </div>
        <Card className=" bg-[#FFF8F9] max-w-md! w-full! border-none shadow-lg px-10">
          {new Array(8).fill(0).map((_, i) => (
            <div key={i} className="text-sm flex items-center  justify-between">
              <div className=" font-medium flex items-center gap-3">
                <span>{i + 1}.</span>
                <Image
                  src={"/img/avatar.png"}
                  alt="leaderboard"
                  className="w-5 h-5 object-cover"
                  width={1000}
                  height={1000}
                />
                <span className="  ">David</span>
              </div>
              <h6 className=" text-gray-400">100XP</h6>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
