import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
export default function Stat() {
  return (
    <div className=" flex py-10 justify-between">
      <EmptyStat />
      <Button className="text-base font-semibold text-accent bg-transparent px-20! py-8! rounded-full  hover:bg-accent/10 border">
        + Subscribe to New Exam
      </Button>
    </div>
  );
}

export function EmptyStat() {
  return (
    <Empty className=" border rounded-full h-16  max-w-80  ">
      <EmptyHeader>
        <EmptyTitle>No data</EmptyTitle>
      </EmptyHeader>
      <EmptyContent></EmptyContent>
    </Empty>
  );
}
