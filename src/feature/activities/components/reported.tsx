import { useReportedQuestions } from "../hooks/useActivities";
import { Loader2 } from "lucide-react";
import type { RichContentBlock } from "@/api/types/exam.types";

// Helper to extract text from rich content blocks
const extractTextFromRichContent = (blocks: RichContentBlock[]): string => {
  return blocks
    .map((block) => {
      if (block.type === "text") return block.value;
      if (block.type === "markdown") return block.content;
      if (block.type === "latex") return block.value;
      return "";
    })
    .join(" ")
    .trim();
};

export default function Reported() {
  const { data: reports, isLoading } = useReportedQuestions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No reported questions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reports.map((report) => {
        const year = report.question.year || "";

        return (
          <div
            key={report.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
          >
            <p className="text-gray-900 font-medium leading-relaxed mb-4 text-base">
              {extractTextFromRichContent(report.question.questionText)}
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                {report.reason}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                {report.status}
              </span>
              {year && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  {year}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
