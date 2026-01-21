"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/tables/data-table";
import { TablePagination } from "@/components/tables/table-pagination";
import { createColumns } from "../columns";
import { TableTabs } from "@/components/tables/table-tabs";
import { SearchInput } from "@/components/globals/search-input";
import { useAllTutorials } from "@/features/tutorials/api/tutorial/get-all-tutorials";
import { useDeleteTutorial } from "@/features/tutorials/api/tutorial/delete-tutorial";

import { useSearch } from "@/lib/url-state";
import { toast } from "sonner";
import {
  Subject,
  SubjectsResponse,
  useSubjects,
} from "@/features/subjects/api/subject/get-subjects";
import { Tutorial } from "../api/tutorial/get-tutorials";

const TutorialTable = () => {
  const ENTRIES_PER_PAGE = 10;
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");
  const { searchQuery } = useSearch();
  const [page, setPage] = useState(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tutorialToDelete, setTutorialToDelete] = useState<Tutorial | null>(
    null
  );

  // Determine tutorial type filter from query params
  const typeFilter = useMemo(() => {
    if (filterParam === "text") return "TEXT_TUTORIAL" as const;
    if (filterParam === "video") return "VIDEO_TUTORIAL" as const;
    return undefined;
  }, [filterParam]);

  const { data: subjectsData } = useSubjects({
    limit: 100,
  }) as {
    data: SubjectsResponse | undefined;
    isLoading: boolean;
  };

  const subjects = subjectsData?.data || [];

  const {
    data: tutorialsData,
    isLoading,
    refetch,
  } = useAllTutorials({
    page,
    limit: ENTRIES_PER_PAGE,
    type: typeFilter,
    search: searchQuery || undefined,
    subjectId: selectedSubjectId || undefined,
  });

  const { mutate: deleteTutorial, isPending: isDeleting } = useDeleteTutorial({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Tutorial deleted successfully");
        setDeleteDialogOpen(false);
        setTutorialToDelete(null);
        refetch();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete tutorial");
      },
    },
  });

  const tutorials = tutorialsData?.data || [];
  const totalEntries = tutorialsData?.meta?.total || 0;

  const handleDelete = (tutorial: Tutorial) => {
    setTutorialToDelete(tutorial);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (tutorialToDelete) {
      deleteTutorial({ id: tutorialToDelete.id });
    }
  };

  const columns = useMemo(
    () => createColumns(handleDelete, refetch),
    [refetch]
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
      <Card className="mt-10 p-2">
        <CardHeader className="border-b-0 gap-32 justify-start">
          <CardTitle className="text-lg font-semibold text-gray-800">
            All Tutorials
          </CardTitle>
          <div className="flex items-center gap-5">
            <SearchInput placeholder="Search tutorials..." />
            <Select
              value={selectedSubjectId || "all"}
              onValueChange={(value) =>
                setSelectedSubjectId(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter by Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject: Subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="border-0">
          <TableTabs tabs={tutorialTabs} baseUrl="/tutorials" />
          <div className="pt-10">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tutorials.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No tutorials found
              </div>
            ) : (
              <DataTable columns={columns} data={tutorials} />
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t-0">
          <TablePagination
            totalEntries={totalEntries}
            entriesPerPage={ENTRIES_PER_PAGE}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tutorial</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{tutorialToDelete?.name}
              &quot;? This will also delete all chapters associated with this
              tutorial. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TutorialTable;

const tutorialTabs = [
  { title: "All Tutorials", href: "?filter=all" },
  { title: "Text Tutorials", href: "?filter=text" },
  { title: "Video Tutorials", href: "?filter=video" },
];
