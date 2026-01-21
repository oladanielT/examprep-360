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
import { createColumns, InstitutionRow, UniversityRow, FacultyRow, DepartmentRow } from "../columns";
import { TableTabs } from "@/components/tables/table-tabs";
import { FilterDialog } from "./institution-table-filter";
import { useState, useMemo } from "react";
import { SearchInput } from "@/components/globals/search-input";
import { useHomeFilters } from "@/features/home/lib/home-url-state";
import { Badge } from "@/components/ui/badge";
import { useUniversities, University, Faculty, Department, UniversitiesResponse } from "../api/university/get-universities";
import { usePagination } from "@/lib/url-state";

const InstitutionTable = () => {
  const ENTRIES_PER_PAGE = 10;
  const { activeFilterCount } = useHomeFilters();
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // Use pagination hook for URL state management
  const {
    page,
    limit,
    setPage,
    setLimit,
    goToNextPage,
    goToPreviousPage,
  } = usePagination(ENTRIES_PER_PAGE);

  const { data: universitiesData, refetch, isLoading: isLoadingUniversities } = useUniversities({
    page,
    limit,
    sortBy: "name",
    sortOrder: "ASC",
  }) as {
    data: UniversitiesResponse | undefined;
    refetch: () => void;
    isLoading: boolean;
  };

  const transformedData = useMemo(() => {
    if (!universitiesData?.data) return [];

    return universitiesData.data.map((university: University): UniversityRow => ({
      id: university.id,
      name: university.name,
      acronym: university.acronym,
      schoolType: university.type,
      type: "university",
      coursesCount: 0, // TODO: Get actual count from API
      date: new Date(university.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      faculties: university.faculties?.map((faculty: Faculty): FacultyRow => ({
        id: faculty.id,
        name: faculty.name,
        type: "faculty",
        universityId: university.id,
        coursesCount: 0, // TODO: Get actual count
        date: new Date(faculty.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        // Use departments directly from API
        departments: faculty.departments?.map((dept: Department): DepartmentRow => ({
          id: dept.id,
          name: dept.name,
          type: "department",
          facultyId: faculty.id,
          coursesCount: 0,
          date: new Date(dept.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        })) || [],
      })),
      imageUrl: university.imageUrl,
    }));
  }, [universitiesData]);

  const columns = useMemo(() => createColumns(() => refetch()), [refetch]);

  const table = useReactTable({
    data: transformedData,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: (row) => {
      if (row.type === "university") {
        return (row as UniversityRow).faculties as any;
      }
      if (row.type === "faculty") {
        return (row as FacultyRow).departments as any;
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
          All Institutions
        </CardTitle>
        <div className="flex items-center gap-5">
          <SearchInput placeholder="Search..." />
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
      <CardContent className="border-0 ">
        <TableTabs tabs={institutionsTabs} baseUrl="/institutions" />
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
                {isLoadingUniversities ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      {Array.from({ length: 5 }).map((_, cellIndex) => (
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
                      No results.
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
          totalEntries={universitiesData?.total || 0}
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

export default InstitutionTable;

const institutionsTabs = [
  { title: "All Institutions", href: "?filter=all" },
  { title: "University", href: "?filter=university" },
  { title: "Polytechnic", href: "?filter=polytechnic" },
  { title: "College", href: "?filter=college" },
];
