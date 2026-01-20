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

  // Get XP based on period
  const getXPForPeriod = (entry: any) => {
    if (period === "weekly") return entry.weeklyXP;
    if (period === "monthly") return entry.monthlyXP;
    return entry.xp; // allTime
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
    <div className="">
      <CustomPageHeader
        backLink="/"
        search={false}
        heading="Leaderboard"
        filter={true}
        subHeading="See your position in contrast to others"
      />
      <div className="flex items-start py-10 gap-20">
        <div className="space-y-5 max-w-80 gap-5">
          <img
            src={"/svg/competition.svg"}
            alt="leaderboard"
            className="w-72 h-44"
            width={1000}
            height={1000}
          />
          <p className="text-lg font-medium">
            {getMotivationalMessage()}
          </p>

          {myRank && (
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
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
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          )}
        </div>

        <Card className="bg-[#FFF8F9] max-w-md! w-full! border-none shadow-lg px-10 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#F04F54]" />
            </div>
          ) : !leaderboard || leaderboard.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No leaderboard data available yet
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                const xp = getXPForPeriod(entry);
                const isCurrentUser = myRank?.rank === rank;

                return (
                  <div
                    key={entry.id}
                    className={`text-sm flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                      isCurrentUser
                        ? "bg-[#F04F54]/10 border border-[#F04F54]/30"
                        : "hover:bg-white/50"
                    }`}
                  >
                    <div className="font-medium flex items-center gap-3">
                      <span className="text-gray-600 w-6">{rank}.</span>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={entry.profilePictureUrl || "/img/avatar.png"} />
                        <AvatarFallback>{getInitials(entry.fullName)}</AvatarFallback>
                      </Avatar>
                      <span className={isCurrentUser ? "text-[#F04F54] font-semibold" : ""}>
                        {isCurrentUser ? "You" : entry.fullName}
                      </span>
                    </div>
                    <h6 className="text-gray-400 font-medium">{xp}XP</h6>
                  </div>
                );
              })}
            </div>
          )}

          {leaderboard && leaderboard.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
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
