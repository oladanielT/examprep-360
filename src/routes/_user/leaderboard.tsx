import { createFileRoute } from "@tanstack/react-router";
import CustomPageHeader from "@/components/global/custom-page-header";
import { Card } from "@/components/ui/card";
import { useLeaderboard, useMyRank } from "@/feature/progress/hooks/useProgress";
import { Loader2, TrendingUp, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function LeaderboardPage() {
  const period = "weekly" as const;

  const { data: leaderboard, isLoading } = useLeaderboard({ period, limit: 10 });
  const { data: myRank } = useMyRank({ period });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getXPForPeriod = (entry: any) => {
    if (period === "weekly") return entry.weeklyXP;
    if (period === "monthly") return entry.monthlyXP;
    return entry.xp;
  };

  const getMotivationalMessage = () => {
    if (!myRank?.rank) return "Keep pushing to get on the leaderboard!";

    const rank = myRank.rank;
    const ordinal = rank === 1 ? "1st" : rank === 2 ? "2nd" : rank === 3 ? "3rd" : `${rank}th`;

    if (rank === 1) return "You're at the top! Keep up the great work!";
    if (rank <= 3) return `You placed ${ordinal} this ${period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'overall'}! Amazing performance!`;
    return `You placed ${ordinal} this ${period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'overall'}, you can do better! Keep pushing!`;
  };

  return (
    <div>
      <CustomPageHeader
        backLink="/"
        search={false}
        heading="Leaderboard"
        filter={true}
        subHeading="See your position in contrast to others"
      />

      <div className="flex flex-col lg:flex-row items-start py-6 sm:py-10 gap-8 lg:gap-16 xl:gap-20">
        {/* Left: illustration + rank card */}
        <div className="w-full lg:max-w-80 space-y-5">
          <img
            src="/svg/competition.svg"
            alt="leaderboard"
            className="w-full max-w-[280px] h-auto mx-auto lg:mx-0"
            width={1000}
            height={1000}
          />
          <p className="text-base sm:text-lg font-medium text-center lg:text-left">
            {getMotivationalMessage()}
          </p>

          {myRank && (
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {period === "weekly" ? "This week, you came in" : period === "monthly" ? "This month, you came in" : "Overall, you came in"}
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {myRank.rank === 1 ? "1st" : myRank.rank === 2 ? "2nd" : myRank.rank === 3 ? "3rd" : `${myRank.rank}th`} place
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
              </div>
            </Card>
          )}
        </div>

        {/* Right: leaderboard list */}
        <Card className="bg-[#FFF8F9] w-full lg:max-w-md! border-none shadow-lg px-4 sm:px-8 lg:px-10 py-5 sm:py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#F04F54]" />
            </div>
          ) : !leaderboard || leaderboard.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No leaderboard data available yet
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-4">
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                const xp = getXPForPeriod(entry);
                const isCurrentUser = myRank?.rank === rank;

                return (
                  <div
                    key={entry.id}
                    className={`text-sm flex items-center justify-between py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg transition-colors ${
                      isCurrentUser
                        ? "bg-[#F04F54]/10 border border-[#F04F54]/30"
                        : "hover:bg-white/50"
                    }`}
                  >
                    <div className="font-medium flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="text-gray-600 w-5 sm:w-6 shrink-0 text-xs sm:text-sm">{rank}.</span>
                      <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                        <AvatarImage src={entry.profilePictureUrl || "/img/avatar.png"} />
                        <AvatarFallback className="text-xs">{getInitials(entry.fullName)}</AvatarFallback>
                      </Avatar>
                      <span className={`truncate text-xs sm:text-sm ${isCurrentUser ? "text-[#F04F54] font-semibold" : ""}`}>
                        {isCurrentUser ? "You" : entry.fullName}
                      </span>
                    </div>
                    <span className="text-gray-400 font-medium text-xs sm:text-sm shrink-0 ml-2">{xp}XP</span>
                  </div>
                );
              })}
            </div>
          )}

          {leaderboard && leaderboard.length > 0 && (
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 text-center text-xs sm:text-sm text-gray-500">
              {leaderboard.length} participants shown
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_user/leaderboard")({
  component: LeaderboardPage,
});
