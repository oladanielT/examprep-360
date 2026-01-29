import { usePausedExams } from "../hooks/useActivities";
import { Loader2, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export default function Paused() {
  const { data: attempts, isLoading } = usePausedExams();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!attempts || attempts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No paused exams found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {attempts.map((attempt) => {
        const subject = attempt.exam?.subject?.name || "Unknown Subject";
        const answeredCount = attempt._count?.responses || 0;
        const totalQuestions = attempt.exam?.numQuestions || 0;
        const pausedDate = attempt.pausedAt || attempt.updatedAt;
        const formattedDate = pausedDate
          ? new Date(pausedDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })
          : "";
        const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

        return (
          <button
            key={attempt.id}
            onClick={() => navigate({ to: `/exam/${attempt.id}` })}
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-[#F04F54]/30 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <img
                  src="/img/jamb.png"
                  alt={subject}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {subject}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {answeredCount}/{totalQuestions} answered
                </p>

                {/* Progress bar */}
                <div className="mt-2.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  {formattedDate && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formattedDate}
                    </span>
                  )}
                  <span className="text-xs font-medium text-[#F04F54] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    Resume <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
