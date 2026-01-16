import { Dot } from "lucide-react";

export default function Reported() {
  return (
    <div className=" grid grid-cols-2 gap-5">
      {new Array(4).fill(0).map((_, i) => (
        <div
          key={i}
          className="  rounded-3xl  shadow p-5  space-y-5  border justify-between"
        >
          <h6 className=" leading-tight  font-semibold">
            In the match against the uplanders team, the sub mariners turned out
            to be the dark horse
          </h6>
          <div className=" font-medium text-xs gap-4 bg-[#FCF8F4] flex  items-center p-3 rounded-lg">
            <Dot className="bg-[#FF9326] h-1 w-1 rounded-full" />
            <p className=" "> WAEC Exam</p>
            <Dot className="bg-[#FF9326] h-1 w-1 rounded-full" />
            <p className=" "> English Lang</p>
            <Dot className="bg-[#FF9326] h-1 w-1 rounded-full" />
            <p className=" "> 1980</p>
          </div>
        </div>
      ))}
    </div>
  );
}
