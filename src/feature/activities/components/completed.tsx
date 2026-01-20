import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExamHistory } from "../hooks/useActivities";
import { Loader2 } from "lucide-react";
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

  const exams = data?.data?.items || [];

  if (exams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No completed exams found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {exams.map((exam) => (
        <div
          key={exam.id}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="w-20 h-20 flex items-center justify-center">
              <img
                src="/img/jamb.png"
                alt={exam.exam.subject?.name || exam.exam.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center">
              <h3 className="text-base font-semibold text-gray-900">
                {exam.exam.subject?.name || exam.exam.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                {exam.percentage !== undefined && (
                  <span className={exam.passed ? "text-green-600" : "text-red-600"}>
                    {exam.percentage.toFixed(0)}%
                  </span>
                )}
                {exam.totalScore !== undefined && (
                  <span>Score: {exam.totalScore}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
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
