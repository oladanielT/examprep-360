"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FilterIcon } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ExpandedState,
} from "@tanstack/react-table";
import { TablePagination } from "@/components/tables/table-pagination";
import { createColumns, SubjectRow, TopicRow, SubtopicRow } from "../columns";
import { FilterSubjectDialog } from "./filter-subject-dialog";
import { SearchInput } from "@/components/globals/search-input";
import { useSubjectFilters } from "../lib/subjects-url-state";
import { Badge } from "@/components/ui/badge";
import {
  useAllExamTypes,
  ExamTypesResponse,
} from "@/features/exams/api/exam-types/get-all-exam-types";

interface Subject {
  id: string;
  name: string;
  examTypeId: string;
  year: number | null;
  paper: string | null;
  textTutorialCount: number;
  videoTutorialCount: number;
  createdAt: string;
  updatedAt: string;
  topics?: Topic[];
}

interface Topic {
  id: string;
  name: string;
  subjectId: string;
  createdAt: string;
  updatedAt: string;
  subTopics?: SubTopic[];
  questions?: unknown[];
}

interface SubTopic {
  id: string;
  name: string;
  topicId: string;
  createdAt: string;
  updatedAt: string;
}

interface ExamType {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  subjects?: Subject[];
}

// Union type for all row types in the hierarchy
type SubjectHierarchyRow = SubjectRow | TopicRow | SubtopicRow;

const SubjectTable = () => {
  const { filters, updateFilters, activeFilterCount } = useSubjectFilters();
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // Fetch ALL exam types with nested subjects, topics, and subtopics
  const {
    data: examTypesData,
    isLoading,
    refetch,
  } = useAllExamTypes({
    page: 1,
    limit: 100, // Get all exam types
  }) as {
    data: ExamTypesResponse | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  // Flatten subjects from all exam types and apply filters
  const allSubjects = useMemo(() => {
    if (!examTypesData?.data) return [];

    const subjects: Array<Subject & { examTypeName: string }> = [];

    examTypesData.data.forEach((examType: ExamType) => {
      if (examType.subjects && examType.subjects.length > 0) {
        examType.subjects.forEach((subject: Subject) => {
          subjects.push({
            ...subject,
            examTypeName: examType.name,
          });
        });
      }
    });

    return subjects;
  }, [examTypesData]);

  // Apply filters
  const filteredSubjects = useMemo(() => {
    let filtered = allSubjects;

    // Filter by exam type if selected
    if (filters.examTypeId) {
      filtered = filtered.filter(
        (subject) => subject.examTypeId === filters.examTypeId
      );
    }

    // Filter by year if selected
    if (filters.year) {
      filtered = filtered.filter((subject) => subject.year === filters.year);
    }

    // Filter by search term
    if (filters.search) {
      filtered = filtered.filter((subject) =>
        subject.name.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    return filtered;
  }, [allSubjects, filters.examTypeId, filters.year, filters.search]);

  // Transform subjects into hierarchical structure
  const transformedData = useMemo(() => {
    return filteredSubjects.map((subject): SubjectRow => {
      const topicsCount = subject.topics?.length || 0;
      const subtopicsCount =
        subject.topics?.reduce(
          (total, topic) => total + (topic.subTopics?.length || 0),
          0
        ) || 0;

      return {
        id: subject.id,
        name: subject.name,
        type: "subject",
        examType: subject.examTypeName,
        examTypeId: subject.examTypeId,
        year: subject.year!,
        paper: subject.paper!,
        topicsCount,
        subtopicsCount,
        date: new Date(subject.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        topics:
          subject.topics?.map(
            (topic: Topic): TopicRow => ({
              id: topic.id,
              name: topic.name,
              type: "topic",
              subjectId: subject.id,
              subtopicsCount: topic.subTopics?.length || 0,
              date: new Date(topic.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              subTopics:
                topic.subTopics?.map(
                  (subtopic: SubTopic): SubtopicRow => ({
                    id: subtopic.id,
                    name: subtopic.name,
                    type: "subtopic",
                    topicId: topic.id,
                    date: new Date(subtopic.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    ),
                  })
                ) || [],
            })
          ) || [],
      };
    });
  }, [filteredSubjects]);

  // Create columns with refresh callback
  const columns = useMemo(() => createColumns(refetch), [refetch]);

  const table = useReactTable<SubjectHierarchyRow>({
    data: transformedData,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: (row): SubjectHierarchyRow[] | undefined => {
      if (row.type === "subject") {
        return (row as SubjectRow).topics;
      }
      if (row.type === "topic") {
        return (row as TopicRow).subTopics;
      }
      return undefined;
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <Card className="mt-10 p-2">
      <CardHeader className="border-b-0 gap-32 justify-start">
        <CardTitle className="text-lg font-semibold text-gray-800">
          All Subjects
        </CardTitle>
        <div className="flex items-center gap-5">
          <SearchInput placeholder="Search subjects..." />
          <FilterSubjectDialog>
            <Button variant="outline" className="gap-2 bg-transparent">
              <FilterIcon className="size-4" />
              Filter
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </FilterSubjectDialog>
        </div>
      </CardHeader>
      <CardContent className="border-0">
        <div className="pt-10">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      {Array.from({ length: 6 }).map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <div className="h-6 bg-muted animate-pulse rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    return (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No subjects found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t-0">
        <div className="text-sm text-muted-foreground">
          Showing {transformedData.length} subject
          {transformedData.length !== 1 ? "s" : ""}
        </div>
      </CardFooter>
    </Card>
  );
};

export default SubjectTable;
