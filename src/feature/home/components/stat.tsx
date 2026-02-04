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
    <div className="flex flex-col gap-4 py-6 sm:py-10 sm:flex-row sm:justify-between sm:items-center">
      {hasData ? (
        <Link to="/leaderboard" className="block w-full sm:w-auto">
          <div className="border-2 border-green-500 rounded-2xl sm:rounded-full py-4 px-5 sm:py-5 sm:px-8 flex items-center gap-3 sm:gap-6 hover:shadow-lg transition-all cursor-pointer bg-white overflow-hidden">
            {/* Streak Section */}
            <div className="flex items-center gap-2 shrink-0">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 2L4.09 12.11C3.68 12.59 3.78 13.3 4.3 13.66L8 16V22H16V16L19.7 13.66C20.22 13.3 20.32 12.59 19.91 12.11L11 2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-2xl font-bold text-gray-900">
                {currentStreak}
              </span>
              <span className="text-sm text-gray-500">Days</span>
            </div>

            {/* Stair Chart Icon - hidden on small mobile */}
            <svg
              className="w-8 h-8 text-green-500 shrink-0 hidden lg:block"
              viewBox="0 0 32 32"
              fill="currentColor"
            >
              <rect x="2" y="22" width="8" height="8" rx="1" />
              <rect x="12" y="14" width="8" height="16" rx="1" />
              <rect x="22" y="6" width="8" height="24" rx="1" />
            </svg>

            {/* Rank Text */}
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                This week, you came in
              </p>
              <p className="text-base sm:text-lg font-bold text-gray-900">
                {myRank?.rank ? getRankOrdinal(myRank.rank) : "—"} place
              </p>
            </div>

            {/* Chevron */}
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 shrink-0 ml-auto" />
          </div>
        </Link>
      ) : (
        <EmptyStat />
      )}

      <Link to="/subscription/add">
        <Button className="text-base font-semibold text-accent bg-transparent px-8 sm:px-20! py-6 sm:py-8! rounded-full hover:bg-accent/10 border w-full sm:w-auto">
          + Subscribe to New Exam
        </Button>
      </Link>
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
