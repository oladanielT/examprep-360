"use client";

import { useParams, useRouter } from "next/navigation";
import { AppSidebarContent, PageHeader } from "@/components/globals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MoreHorizontal,
  ArrowLeft,
  Loader2,
  BookOpen,
  FileText,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTutorial } from "@/features/tutorials/api/tutorial/get-tutorial";
import {
  useChapters,
  type Chapter,
} from "@/features/tutorials/api/chapter/get-chapters";
import { useDeleteChapter } from "@/features/tutorials/api/chapter/delete-chapter";
import { useUpdateChapter } from "@/features/tutorials/api/chapter/update-chapter";
import { EditTutorialDialog } from "@/features/tutorials/components/edit-tutorial-dialog";
import { format } from "date-fns";

interface ApiError {
  message?: string;
}

const TutorialDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const tutorialId = params.id as string;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: tutorial, isLoading: isLoadingTutorial } = useTutorial({
    id: tutorialId,
  });

  const {
    data: chaptersData,
    isLoading: isLoadingChapters,
    refetch: refetchChapters,
  } = useChapters({
    tutorialId,
    limit: 100,
  });

  const { mutate: deleteChapter, isPending: isDeleting } = useDeleteChapter({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Chapter deleted successfully");
        setDeleteDialogOpen(false);
        setChapterToDelete(null);
        refetchChapters();
      },
      onError: (error: Error) => {
        const apiError = error as ApiError;
        toast.error(apiError?.message || "Failed to delete chapter");
      },
    },
  });

  const { mutate: updateChapter } = useUpdateChapter({
    mutationConfig: {
      onSuccess: () => {
        refetchChapters();
      },
      onError: (error: Error) => {
        toast.error(error?.message || "Failed to update chapter order");
      },
    },
  });

  const chapters: Chapter[] = chaptersData?.data || [];

  const handleDeleteChapter = () => {
    if (chapterToDelete) {
      deleteChapter({ chapterId: chapterToDelete.id, tutorialId });
    }
  };

  const handleMoveChapter = (chapterId: string, direction: "up" | "down") => {
    const currentIndex = chapters.findIndex((c) => c.id === chapterId);
    if (currentIndex === -1) return;

    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === chapters.length - 1) return;

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const currentChapter = chapters[currentIndex];
    const targetChapter = chapters[targetIndex];

    // Update current chapter with target's order
    updateChapter({
      chapterId: currentChapter.id,
      data: {
        order: targetChapter.order,
      },
    });

    // Update target chapter with current's order
    updateChapter({
      chapterId: targetChapter.id,
      data: {
        order: currentChapter.order,
      },
    });

    toast.success("Chapter order updated");
  };

  if (isLoadingTutorial) {
    return (
      <AppSidebarContent>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppSidebarContent>
    );
  }

  if (!tutorial) {
    return (
      <AppSidebarContent>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Tutorial not found</p>
          <Button variant="outline" onClick={() => router.push("/tutorials")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tutorials
          </Button>
        </div>
      </AppSidebarContent>
    );
  }

  return (
    <AppSidebarContent>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/tutorials")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <PageHeader
            name={tutorial.name}
            desc={`${
              tutorial.type === "TEXT_TUTORIAL" ? "Text" : "Video"
            } Tutorial`}
          />
        </div>
        <EditTutorialDialog tutorial={tutorial} onSuccess={() => {}}>
          <Button variant="outline">Edit Tutorial</Button>
        </EditTutorialDialog>
      </div>

      {/* Tutorial Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Tutorial Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <Badge
                variant={
                  tutorial.type === "TEXT_TUTORIAL" ? "default" : "secondary"
                }
              >
                {tutorial.type === "TEXT_TUTORIAL"
                  ? "Text Tutorial"
                  : "Video Tutorial"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chapters</p>
              <p className="font-medium">{chapters.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {format(new Date(tutorial.createdAt), "MMM dd, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {format(new Date(tutorial.updatedAt), "MMM dd, yyyy")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapters Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Chapters ({chapters.length})
          </CardTitle>
          <Button
            onClick={() => router.push(`/tutorials/${tutorialId}/chapters/new`)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Chapter
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingChapters ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : chapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <p className="text-muted-foreground">No chapters yet</p>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/tutorials/${tutorialId}/chapters/new`)
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Chapter
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Content Blocks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chapters.map((chapter, index) => (
                  <TableRow key={chapter.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{chapter.order}</span>
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => handleMoveChapter(chapter.id, "up")}
                            disabled={index === 0}
                            title="Move up"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() =>
                              handleMoveChapter(chapter.id, "down")
                            }
                            disabled={index === chapters.length - 1}
                            title="Move down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{chapter.name}</TableCell>
                    <TableCell>{chapter.content?.length || 0} blocks</TableCell>
                    <TableCell>
                      {format(new Date(chapter.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/tutorials/${tutorialId}/chapters/${chapter.id}`
                              )
                            }
                          >
                            Edit Chapter
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setChapterToDelete({
                                id: chapter.id,
                                name: chapter.name,
                              });
                              setDeleteDialogOpen(true);
                            }}
                            className="text-destructive"
                          >
                            Delete Chapter
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{chapterToDelete?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChapter}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppSidebarContent>
  );
};

export default TutorialDetailPage;
