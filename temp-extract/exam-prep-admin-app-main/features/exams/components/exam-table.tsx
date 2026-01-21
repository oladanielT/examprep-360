"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Filter, FilterIcon, SearchIcon } from "lucide-react";
import React, { useState, useMemo } from "react";
import { DataTable } from "@/components/tables/data-table";
import { TablePagination } from "@/components/tables/table-pagination";
import { Exam, createColumns } from "../columns";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterExamDialog } from "./filter-exam-dialog";
import { useExamFilters } from "../lib/exam-url-state";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/globals/search-input";
import { useAllExamTypes, ExamType, ExamTypesResponse } from "../api/exam-types/get-all-exam-types";
import { TableTabs } from "@/components/tables/table-tabs";
import { usePagination } from "@/lib/url-state";

// Helper function to format category labels
const formatCategoryLabel = (category: string): string => {
  return category
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ExamTable = () => {
  const ENTRIES_PER_PAGE = 10;
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("filter") || "all";

  // Use pagination hook for URL state management
  const {
    page,
    limit,
    setPage,
    setLimit,
    goToNextPage,
    goToPreviousPage,
  } = usePagination(ENTRIES_PER_PAGE);

  const handleApplyFilters = () => {
    console.log("Applying filters:");
  };

  const { activeFilterCount } = useExamFilters();

  // Fetch all exam types with pagination
  const { data: examTypesResponse, isLoading, refetch } = useAllExamTypes({
    page,
    limit,
    sortBy: "name",
    sortOrder: "ASC",
    queryConfig: {},
  }) as {
    data: ExamTypesResponse | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  const examTypes = examTypesResponse?.data || [];

  // Create columns with refetch callback
  const columns = useMemo(() => createColumns(() => refetch()), [refetch]);

  // Extract unique categories and create tabs
  const examTabs = useMemo(() => {
    if (!examTypes.length) return [{ title: "All Exams", href: "?filter=all" }];

    const uniqueCategories = Array.from(
      new Set(examTypes.map((exam: ExamType) => exam.category))
    ).filter(Boolean);

    return [
      { title: "All Exams", href: "?filter=all" },
      ...uniqueCategories.map((category: string) => ({
        title: formatCategoryLabel(category),
        href: `?filter=${category.toLowerCase()}`,
      })),
    ];
  }, [examTypes]);

  // Filter exam types by selected category
  const filteredExamTypes = useMemo(() => {
    if (!examTypes.length) return [];
    if (currentFilter === "all") return examTypes;

    return examTypes.filter(
      (exam: ExamType) => exam.category.toLowerCase() === currentFilter.toLowerCase()
    );
  }, [examTypes, currentFilter]);

  // Transform ExamType to Exam format for the table
  const transformedData: Exam[] = useMemo(() => {
    return filteredExamTypes.map((examType: ExamType) => ({
      id: examType.id,
      examName: examType.name,
      category: examType.category,
      subjects: examType.subjects?.length?.toString() || "0",
      subscribers: "0", // TODO: Get actual subscriber count from API
      date: new Date(examType.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));
  }, [filteredExamTypes]);

  return (
    <Card className="mt-10 p-2">
      <CardHeader className="border-b-0 gap-32 justify-start">
        <CardTitle className="text-lg font-semibold text-gray-800">
          All Exam
        </CardTitle>
        <div className="flex items-center gap-5">
          <SearchInput placeholder="Search..." />
          <FilterExamDialog onApply={handleApplyFilters}>
            <Button variant="outline" className="gap-2 bg-transparent">
              <FilterIcon className="size-4" />
              Filter
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </FilterExamDialog>
        </div>
      </CardHeader>
      <CardContent className="border-0 ">
        <TableTabs tabs={examTabs} baseUrl="/exams" />
        <div className="pt-10">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading exams...</div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={transformedData}
            />
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t-0">
        <TablePagination
          totalEntries={examTypesResponse?.total || 0}
          entriesPerPage={limit}
          currentPage={page}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onNextPage={goToNextPage}
          onPreviousPage={goToPreviousPage}
        />
      </CardFooter>
    </Card>
  );
};

export default ExamTable;
