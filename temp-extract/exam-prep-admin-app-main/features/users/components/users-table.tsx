"use client";
import { TableTabs } from "@/components/tables/table-tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FilterIcon, Loader2 } from "lucide-react";
import React, { useMemo } from "react";
import { createColumns } from "../columns";
import { DataTable } from "@/components/tables/data-table";
import { TablePagination } from "@/components/tables/table-pagination";
import { FilterDialog } from "./users-table-filter";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/globals/search-input";
import { useUserFilters } from "../lib/users-url-state";
import { useStudents, StudentsResponse } from "../api/get-students";

const UsersTable = () => {
  const { filters, updateFilters, activeFilterCount } = useUserFilters();

  // Fetch ALL students (examType is optional filter)
  const {
    data: studentsData,
    isLoading,
    refetch,
  } = useStudents({
    examType: filters.examType || undefined,
    page: filters.page,
    limit: filters.limit,
  }) as {
    data: StudentsResponse | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  const students = studentsData?.data || [];
  const meta = studentsData;

  // Create columns with refresh callback
  const columns = useMemo(() => createColumns(refetch), [refetch]);

  // Filter students by search term on the frontend
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (student) =>
          student.fullName
            .toLowerCase()
            .includes(filters.search!.toLowerCase()) ||
          student.email.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    return filtered;
  }, [students, filters.search]);

  return (
    <Card className="mt-10 p-2">
      <CardHeader className="border-b-0 gap-32 justify-start">
        <CardTitle className="text-lg font-semibold text-gray-800">
          All Users
        </CardTitle>
        <div className="flex items-center gap-5">
          {/* <SearchInput
  placeholder="Search users..."
  defaultValue={filters.search || ""}
  onChange={(value: string) => updateFilters({ search: value || null })}
/> */}
          <FilterDialog>
            <Button variant="outline" className="gap-2 bg-transparent">
              <FilterIcon className="size-4" />
              Filter
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </FilterDialog>
        </div>
      </CardHeader>
      <CardContent className="border-0">
        <TableTabs tabs={userTabs} baseUrl="/users" />
        <div className="pt-10">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No users found
            </div>
          ) : (
            <DataTable columns={columns} data={filteredStudents} />
          )}
        </div>
      </CardContent>
      {meta && (
        <CardFooter className="border-t-0">
          <TablePagination
            totalEntries={meta.total}
            entriesPerPage={filters.limit}
            currentPage={filters.page}
            onPageChange={(page) => updateFilters({ page })}
          />
        </CardFooter>
      )}
    </Card>
  );
};

export default UsersTable;

const userTabs = [
  // Each href is the query string to apply
  { title: "All Users", href: "?filter=all" },
  { title: "Subscribed Users", href: "?filter=subscribed" },
  { title: "Banned Users", href: "?filter=banned" },
  { title: "Inactive Users", href: "?filter=inactive" },
];
