"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  createColumns,
  CourseRow,
  ModuleRow,
  SessionRow,
  CourseHierarchyRow,
} from "../columns-expandable";
import { SearchInput } from "@/components/globals/search-input";
import { CoursesResponse, useCourses } from "../api/course/get-courses";

const CourseTable = () => {
  const ENTRIES_PER_PAGE = 10;
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const {
    data: coursesData,
    isLoading,
    refetch,
  } = useCourses({
    page,
    limit: ENTRIES_PER_PAGE,
    sortBy: "createdAt",
    sortOrder: "DESC",
  }) as {
    data: CoursesResponse | undefined;
    isLoading: boolean;
    refetch: () => void;
  };
  // Transform courses into hierarchical structure
  const transformedData = useMemo(() => {
    if (!coursesData?.data) return [];

    return coursesData.data.map((course): CourseRow => {
      const modulesCount = course.modules?.length || 0;

      return {
        id: course.id,
        name: course.name,
        type: "course",
        code: course.code,
        level: course.level,
        institutionName: course.department.university.name,
        institutionType: course.department.university.type,
        modulesCount,
        date: new Date(course.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        modules:
          course.modules?.map((module): ModuleRow => {
            const sessionsCount = module.sessions?.length || 0;

            return {
              id: module.id,
              name: module.name,
              type: "module",
              courseId: course.id,
              sessionsCount,
              date: new Date(module.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              sessions:
                module.sessions?.map(
                  (session): SessionRow => ({
                    id: session.id,
                    name: session.year,
                    type: "session",
                    year: session.year,
                    moduleId: module.id,
                    date: new Date(session.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    ),
                  })
                ) || [],
            };
          }) || [],
      };
    });
  }, [coursesData]);

  // Create columns with refresh callback
  const columns = useMemo(() => createColumns(refetch), [refetch]);

  const table = useReactTable<CourseHierarchyRow>({
    data: transformedData,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: (row): CourseHierarchyRow[] | undefined => {
      if (row.type === "course") {
        return (row as CourseRow).modules;
      }
      if (row.type === "module") {
        return (row as ModuleRow).sessions;
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
          All Courses
        </CardTitle>
        <div className="flex items-center gap-5">
          <SearchInput placeholder="Search courses..." />
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
                      {Array.from({ length: 10 }).map((_, cellIndex) => (
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
                      No courses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t-0">
        <TablePagination
          totalEntries={coursesData?.total || 0}
          entriesPerPage={ENTRIES_PER_PAGE}
          currentPage={page}
          onPageChange={setPage}
        />
      </CardFooter>
    </Card>
  );
};

export default CourseTable;
