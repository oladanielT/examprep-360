"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/tables/data-table";
import { TablePagination } from "@/components/tables/table-pagination";
import { columns } from "../columns";
import { SearchInput } from "@/components/globals/search-input";
import { QuestionsResponse, useQuestions } from "../api/get-questions";
import { Module } from "@/features/courses/api/course/get-courses";
import { Loader2 } from "lucide-react";

interface QuestionTableProps {
  courseId?: string;
  modules?: Module[];
}

const QuestionTable = ({ courseId, modules = [] }: QuestionTableProps) => {
  const ENTRIES_PER_PAGE = 10;
  const [page, setPage] = useState(1);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  // Get sessions for selected module
  const selectedModule = modules.find((m) => m.id === selectedModuleId);
  const sessions = selectedModule?.sessions || [];

  // Fetch questions
  const { data: questionsData, isLoading } = useQuestions({
    params: {
      ...(courseId && { courseId }),
      ...(selectedSessionId && { sessionId: selectedSessionId }),
      page,
      limit: ENTRIES_PER_PAGE,
    },
  }) as {
    data: QuestionsResponse | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      {courseId && modules.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select
              value={selectedModuleId}
              onValueChange={(value) => {
                setSelectedModuleId(value);
                setSelectedSessionId(""); // Reset session when module changes
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Modules</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select
              value={selectedSessionId}
              onValueChange={(value) => {
                setSelectedSessionId(value);
                setPage(1);
              }}
              disabled={!selectedModuleId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sessions</SelectItem>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    Year: {session.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <SearchInput placeholder="Search questions..." />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="pt-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable columns={columns} data={questionsData?.data || []} />
        )}
      </div>

      {/* Pagination */}
      <div className="pt-4">
        <TablePagination
          totalEntries={questionsData?.total || 0}
          entriesPerPage={ENTRIES_PER_PAGE}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default QuestionTable;
const questionTabs = [
  // Each href is the query string to apply
  { title: "All Questions", href: "?filter=all" },
  { title: "Reported Questions ", href: "?filter=subscribed" },
  { title: "Pending Questions", href: "?filter=pending" },
  { title: "Track Edits", href: "?filter=track" },
];
