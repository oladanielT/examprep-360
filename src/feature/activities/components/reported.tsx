import { useReportedQuestions } from "../hooks/useActivities";
import { Loader2, AlertTriangle } from "lucide-react";
import type { RichContentBlock } from "@/api/types/exam.types";

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

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  RESOLVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
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
    <div className="space-y-3 sm:space-y-4">
      {reports.map((report) => {
        const year = report.question?.year || "";
        const reportedDate = report.createdAt
          ? new Date(report.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "";
        const statusClass = statusColors[report.status] || "bg-gray-100 text-gray-700";

        return (
          <div
            key={report.id}
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-gray-900 font-medium leading-relaxed line-clamp-2 break-words [word-break:break-word]">
                  {extractTextFromRichContent(report.question?.questionText || [])}
                </p>

                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs mt-2.5">
                  <span className={`capitalize px-2 py-0.5 rounded-full font-medium ${statusClass}`}>
                    {report.status?.toLowerCase()}
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {report.reason}
                  </span>
                  {year && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {year}
                    </span>
                  )}
                  {reportedDate && (
                    <span className="text-gray-400 ml-auto hidden sm:inline">
                      {reportedDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
