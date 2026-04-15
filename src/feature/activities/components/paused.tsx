import { usePausedExams } from "../hooks/useActivities";
import { useResumeExam } from "@/feature/exams/hooks/useExams";
import { useExamStore } from "@/stores/examStore";
import { Loader2, Clock, BookOpen } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

function formatTimeSpent(seconds?: number) {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`;
}

export default function Paused() {
  const { data: attempts, isLoading } = usePausedExams();
  const navigate = useNavigate();
  const resumeExam = useResumeExam();
  const startExam = useExamStore((state) => state.startExam);
  const submitResponse = useExamStore((state) => state.submitResponse);
  const setAnswer = useExamStore((state) => state.setAnswer);
  const [resumingId, setResumingId] = useState<string | null>(null);

  const handleResume = (attemptId: string) => {
    if (resumingId) return;
    setResumingId(attemptId);

    resumeExam.mutate(attemptId, {
      onSuccess: (data: any) => {
        if (data.exam?.questions) {
          const examQuestions = data.exam.questions.map((eq: any) => eq.question);
          const totalTimeSeconds = (data.exam.durationMinutes ?? 0) * 60;
          const timeSpent = data.timeSpentSeconds || 0;
          const remainingTimeMinutes = Math.max(0, (totalTimeSeconds - timeSpent) / 60);

          startExam(data, examQuestions, remainingTimeMinutes);

          if (data.responses && Array.isArray(data.responses)) {
            data.responses.forEach((response: any) => {
              submitResponse(response.questionId, response);
              setAnswer(response.questionId, response.answer);
            });
          }

          navigate({ to: `/exam/${attemptId}` });
        }
        setResumingId(null);
      },
      onError: () => {
        setResumingId(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Only show practice exams (mock/simulation exams can't be resumed individually)
  const practiceAttempts = attempts?.filter(
    (a) => a.exam?.examTypeEnum !== "MOCK"
  ) || [];

  if (practiceAttempts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No paused exams found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
      {practiceAttempts.map((attempt) => {
        const examName = attempt.exam?.name || "Practice Exam";
        const totalQuestions = attempt.exam?.numQuestions || 0;
        const timeSpent = formatTimeSpent(attempt.timeSpentSeconds);
        const pausedDate = attempt.pausedAt || attempt.updatedAt;
        const formattedDate = pausedDate
          ? new Date(pausedDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })
          : "";
        const isResuming = resumingId === attempt.id;

        return (
          <button
            key={attempt.id}
            onClick={() => handleResume(attempt.id)}
            disabled={isResuming}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/80 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-200 active:scale-[0.97] text-left disabled:cursor-wait disabled:opacity-70 flex items-stretch"
          >
            {/* Left: icon area */}
            <div className="bg-amber-50/60 p-4 sm:p-5 flex items-center justify-center shrink-0">
              <img
                src="/img/jamb.png"
                alt={examName}
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
              />
            </div>

            {/* Right: content */}
            <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col justify-center">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug line-clamp-1">
                {examName}
              </h3>

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <BookOpen className="w-3 h-3 shrink-0" />
                  {totalQuestions} Qs
                </span>
                {timeSpent && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3 shrink-0" />
                    {timeSpent}
                  </span>
                )}
                {formattedDate && (
                  <span className="text-xs text-gray-400">
                    {formattedDate}
                  </span>
                )}
              </div>

              {/* Resume CTA */}
              <div className="mt-3">
                {isResuming ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F04F54]/10 px-3.5 py-1.5 text-xs font-semibold text-[#F04F54]">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Resuming...
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-[#F04F54] px-3.5 py-1.5 text-xs font-semibold text-white">
                    Resume
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
