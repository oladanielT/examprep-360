import { usePausedExams } from "../hooks/useActivities";
import { Loader2 } from "lucide-react";
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
    <div className="grid grid-cols-3 gap-6">
      {attempts.map((attempt) => {
        const subject = attempt.exam?.subject?.name || "Unknown Subject";
        const answeredCount = attempt._count?.responses || 0;
        const pausedDate = attempt.pausedAt || attempt.updatedAt;
        const formattedDate = pausedDate
          ? new Date(pausedDate).toLocaleString(undefined, {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "";

        return (
          <div
            key={attempt.id}
            onClick={() => navigate({ to: `/exam/${attempt.id}` })}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-20 h-20 flex items-center justify-center">
                <img
                  src="/img/jamb.png"
                  alt={subject}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center">
                <h3 className="text-base font-semibold text-gray-900">
                  {subject}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {attempt.exam?.numQuestions || 0} questions
                </p>
                {answeredCount > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {answeredCount} answered
                  </p>
                )}
                {formattedDate && (
                  <p className="text-xs text-gray-400 mt-1">
                    Paused: {formattedDate}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
