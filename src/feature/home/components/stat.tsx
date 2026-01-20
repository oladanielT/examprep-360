import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { useStreaks, useMyRank } from "@/feature/progress/hooks/useProgress";
import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function Stat() {
  const { data: streaks } = useStreaks();
  const { data: myRank } = useMyRank({ period: "weekly" });

  const currentStreak = streaks?.currentStreak || 0;
  const hasData = currentStreak > 0 || (myRank && myRank.rank > 0);

  const getRankOrdinal = (rank: number) => {
    if (rank === 1) return "1st";
    if (rank === 2) return "2nd";
    if (rank === 3) return "3rd";
    return `${rank}th`;
  };

  return (
    <div className="flex py-10 justify-between items-center">
      {hasData ? (
        <Link to="/leaderboard" className="block">
          <div className="border-2 border-green-500 rounded-full py-5 px-8 flex items-center gap-6 hover:shadow-lg transition-all cursor-pointer bg-white">
            {/* Streak Section */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L4.09 12.11C3.68 12.59 3.78 13.3 4.3 13.66L8 16V22H16V16L19.7 13.66C20.22 13.3 20.32 12.59 19.91 12.11L11 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-2xl font-bold text-gray-900">{currentStreak}</span>
            </div>
            <span className="text-sm text-gray-500">Days</span>

            {/* Stair Chart Icon */}
            <svg className="w-8 h-8 text-green-500 ml-4" viewBox="0 0 32 32" fill="currentColor">
              <rect x="2" y="22" width="8" height="8" rx="1" />
              <rect x="12" y="14" width="8" height="16" rx="1" />
              <rect x="22" y="6" width="8" height="24" rx="1" />
            </svg>

            {/* Rank Text */}
            <div className="ml-2">
              <p className="text-sm text-gray-500">This week, you came in</p>
              <p className="text-lg font-bold text-gray-900">
                {myRank?.rank ? getRankOrdinal(myRank.rank) : "—"} place
              </p>
            </div>

            {/* Chevron */}
            <ChevronRight className="w-6 h-6 text-gray-400 ml-4" />
          </div>
        </Link>
      ) : (
        <EmptyStat />
      )}

      <Button className="text-base font-semibold text-accent bg-transparent px-20! py-8! rounded-full hover:bg-accent/10 border">
        + Subscribe to New Exam
      </Button>
    </div>
  );
}

export function EmptyStat() {
  return (
    <Empty className="border rounded-full h-16 max-w-80">
      <EmptyHeader>
        <EmptyTitle>No data</EmptyTitle>
      </EmptyHeader>
      <EmptyContent></EmptyContent>
    </Empty>
  );
}
