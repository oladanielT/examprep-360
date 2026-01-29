import { useBookmarkedQuestions } from "../hooks/useActivities";
import { Loader2, Bookmark } from "lucide-react";
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

export default function Bookmarked() {
  const { data: bookmarks, isLoading } = useBookmarkedQuestions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No bookmarked questions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {bookmarks.map((bookmark) => {
        const bookmarkedDate = bookmark.createdAt
          ? new Date(bookmark.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "";

        return (
          <div
            key={bookmark.id}
            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-[#F04F54]/30 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                <Bookmark className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-gray-900 font-medium leading-relaxed line-clamp-2 break-words [word-break:break-word]">
                  {extractTextFromRichContent(bookmark.question?.questionText || [])}
                </p>

                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-gray-500 mt-2.5">
                  <span className="capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                    {bookmark.question?.questionType?.replace(/_/g, " ") || "Unknown"}
                  </span>
                  <span className="capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                    {bookmark.question?.difficulty || "Unknown"}
                  </span>
                  {bookmark.question?.year && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                      {bookmark.question.year}
                    </span>
                  )}
                  {bookmarkedDate && (
                    <span className="text-gray-400 ml-auto hidden sm:inline">
                      {bookmarkedDate}
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
