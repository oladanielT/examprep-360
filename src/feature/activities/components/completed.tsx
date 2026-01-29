import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExamHistory } from "../hooks/useActivities";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ExamTypeEnum } from "@/api/types/exam.types";

function CompletedExamsList({ examType }: { examType: ExamTypeEnum }) {
  const { data, isLoading } = useExamHistory({ examType });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const exams = data?.items || [];

  if (exams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No completed exams found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {exams.map((exam) => {
        const completedDate = exam.completedAt || exam.submittedAt;
        const formattedDate = completedDate
          ? new Date(completedDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })
          : "";
        const numQuestions = exam.exam?.numQuestions || 0;
        const passed = exam.passed;
        const percentage = exam.percentage ?? 0;

        return (
          <Link
            key={exam.id}
            to="/exam/review/$attemptId"
            params={{ attemptId: exam.id }}
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-gray-300 hover:shadow-md transition-all block"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <img
                  src="/img/jamb.png"
                  alt={exam.exam?.subject?.name || exam.exam?.name || "Exam"}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {exam.exam?.subject?.name || exam.exam?.name || "Exam"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {numQuestions} questions
                </p>

                {/* Score */}
                <div className="flex items-center gap-2 mt-2.5">
                  {passed !== undefined && (
                    passed ? (
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )
                  )}
                  <span className={`text-lg font-bold ${passed ? "text-green-600" : "text-red-600"}`}>
                    {percentage.toFixed(0)}%
                  </span>
                  {exam.totalScore !== undefined && numQuestions > 0 && (
                    <span className="text-xs text-gray-400">
                      ({exam.totalScore}/{numQuestions})
                    </span>
                  )}
                </div>

                {formattedDate && (
                  <p className="text-xs text-gray-400 mt-1.5">{formattedDate}</p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function Completed() {
  return (
    <Tabs defaultValue="practice" className="w-full">
      <TabsList className="bg-transparent border-b border-gray-200 rounded-none h-auto p-0 w-full justify-start mb-6">
        <TabsTrigger
          value="practice"
          className="data-[state=active]:border-b-2 data-[state=active]:border-[#F04F54] data-[state=active]:text-[#F04F54] data-[state=active]:bg-transparent rounded-none px-4 py-2.5 text-gray-600 text-sm font-medium"
        >
          Practice Exams
        </TabsTrigger>
        <TabsTrigger
          value="mock"
          className="data-[state=active]:border-b-2 data-[state=active]:border-[#F04F54] data-[state=active]:text-[#F04F54] data-[state=active]:bg-transparent rounded-none px-4 py-2.5 text-gray-600 text-sm font-medium"
        >
          Mock Exams
        </TabsTrigger>
      </TabsList>

      <TabsContent value="practice" className="mt-0">
        <CompletedExamsList examType="PRACTICE" />
      </TabsContent>

      <TabsContent value="mock" className="mt-0">
        <CompletedExamsList examType="MOCK" />
      </TabsContent>
    </Tabs>
  );
}
