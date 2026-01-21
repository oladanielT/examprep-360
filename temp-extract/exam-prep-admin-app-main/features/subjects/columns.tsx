"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  BookOpen,
  FolderTree,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Subject, Topic, SubTopic } from "./api/subject/get-subjects";
import { EditSubjectDialog } from "./components/edit-subject-dialog";
import { EditTopicDialog } from "./components/edit-topic-dialog";
import { EditSubtopicDialog } from "./components/edit-subtopic-dialog";
import { AddTopicDialog } from "./components/add-topic-dialog";
import { AddSubtopicDialog } from "./components/add-subtopic-dialog";
import { useDeleteSubject } from "./api/subject/delete-subject";
import { useDeleteTopic } from "./api/topic/delete-topic";
import { useDeleteSubTopic } from "./api/sub-topic/delete-sub-topic";

export type SubjectHierarchyType = "subject" | "topic" | "subtopic";

export interface BaseRow {
  id: string;
  name: string;
  type: SubjectHierarchyType;
  date: string;
}

export interface SubjectRow extends BaseRow {
  type: "subject";
  examType: string;
  examTypeId: string;
  year: number;
  paper?: string;
  topicsCount: number;
  subtopicsCount: number;
  topics?: TopicRow[];
}

export interface TopicRow extends BaseRow {
  type: "topic";
  subjectId: string;
  subtopicsCount: number;
  subTopics?: SubtopicRow[];
}

export interface SubtopicRow extends BaseRow {
  type: "subtopic";
  topicId: string;
}

export type SubjectHierarchyRow = SubjectRow | TopicRow | SubtopicRow;

interface ActionsCellProps {
  row: any;
  onRefresh?: () => void;
}

function ActionsCell({ row, onRefresh }: ActionsCellProps) {
  const item = row.original as SubjectHierarchyRow;
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { mutate: deleteSubject, isPending: isDeletingSubject } =
    useDeleteSubject({
      mutationConfig: {
        onSuccess: () => {
          toast.success("Subject deleted successfully");
          setDeleteDialogOpen(false);
          onRefresh?.();
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to delete subject");
        },
      },
    });

  const { mutate: deleteTopic, isPending: isDeletingTopic } = useDeleteTopic({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Topic deleted successfully");
        setDeleteDialogOpen(false);
        onRefresh?.();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete topic");
      },
    },
  });

  const { mutate: deleteSubtopic, isPending: isDeletingSubtopic } =
    useDeleteSubTopic({
      mutationConfig: {
        onSuccess: () => {
          toast.success("Subtopic deleted successfully");
          setDeleteDialogOpen(false);
          onRefresh?.();
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to delete subtopic");
        },
      },
    });

  const isDeleting = isDeletingSubject || isDeletingTopic || isDeletingSubtopic;

  const handleDelete = () => {
    if (item.type === "subject") {
      const subject = item as SubjectRow;
      deleteSubject({
        subjectId: subject.id,
        examTypeId: subject.examTypeId,
        year: subject.year,
      });
    } else if (item.type === "topic") {
      const topic = item as TopicRow;
      deleteTopic({
        topicId: topic.id,
        subjectId: topic.subjectId,
      });
    } else if (item.type === "subtopic") {
      const subtopic = item as SubtopicRow;
      deleteSubtopic({
        subtopicId: subtopic.id,
        topicId: subtopic.topicId,
      });
    }
  };

  const getDeleteDialogContent = () => {
    const typeLabel = item.type;
    return {
      title: `Delete ${typeLabel}`,
      description: `Are you sure you want to delete "${
        item.name
      }"? This action cannot be undone.${
        item.type === "subject"
          ? " All associated topics and subtopics will also be deleted."
          : item.type === "topic"
          ? " All associated subtopics will also be deleted."
          : ""
      }`,
    };
  };

  // Subject actions
  if (item.type === "subject") {
    const subject = item as SubjectRow;
    const dialogContent = getDeleteDialogContent();

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/subjects/${subject.id}`)}
            >
              View Details
            </DropdownMenuItem>
            <AddTopicDialog subjectId={subject.id} onSuccess={onRefresh}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Add Topic
              </DropdownMenuItem>
            </AddTopicDialog>
            <EditSubjectDialog
              subject={{
                id: subject.id,
                name: subject.name,
                examTypeId: subject.examTypeId,
                year: subject.year,
                paper: subject.paper,
                createdAt: subject.date,
                updatedAt: subject.date,
              }}
              onSuccess={onRefresh}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Edit Subject
              </DropdownMenuItem>
            </EditSubjectDialog>
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive"
            >
              Delete Subject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {dialogContent.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
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
  }

  // Topic actions
  if (item.type === "topic") {
    const topic = item as TopicRow;
    const dialogContent = getDeleteDialogContent();

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <AddSubtopicDialog topicId={topic.id} onSuccess={onRefresh}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Add Subtopic
              </DropdownMenuItem>
            </AddSubtopicDialog>
            <EditTopicDialog
              topic={{
                id: topic.id,
                name: topic.name,
                subjectId: topic.subjectId,
                createdAt: topic.date,
                updatedAt: topic.date,
              }}
              onSuccess={onRefresh}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Edit Topic
              </DropdownMenuItem>
            </EditTopicDialog>
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive"
            >
              Delete Topic
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {dialogContent.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
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
  }

  // Subtopic actions
  if (item.type === "subtopic") {
    const subtopic = item as SubtopicRow;
    const dialogContent = getDeleteDialogContent();

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <EditSubtopicDialog
              subtopic={{
                id: subtopic.id,
                name: subtopic.name,
                topicId: subtopic.topicId,
                createdAt: subtopic.date,
                updatedAt: subtopic.date,
              }}
              onSuccess={onRefresh}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Edit Subtopic
              </DropdownMenuItem>
            </EditSubtopicDialog>
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive"
            >
              Delete Subtopic
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {dialogContent.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
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
  }

  return null;
}

export const createColumns = (
  onRefresh?: () => void
): ColumnDef<SubjectHierarchyRow>[] => [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      const item = row.original;

      // Subtopics can't expand, so show nothing
      if (item.type === "subtopic") {
        return <div className="w-4" />;
      }

      // Check if there are actual children
      let hasChildren = false;
      if (item.type === "subject") {
        const subject = item as SubjectRow;
        hasChildren = (subject.topics?.length || 0) > 0;
      } else if (item.type === "topic") {
        const topic = item as TopicRow;
        hasChildren = (topic.subTopics?.length || 0) > 0;
      }

      // Only show expander if there are children
      if (hasChildren) {
        return (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={(e) => {
              e.stopPropagation();
              row.getToggleExpandedHandler()();
            }}
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        );
      }

      return <div className="w-4" />;
    },
    size: 40,
  },
  {
    accessorKey: "name",
    header: "NAME",
    cell: ({ row }) => {
      const item = row.original;
      const depth = row.depth;

      let icon = null;
      if (item.type === "subject") {
        icon = <BookOpen className="h-4 w-4 text-primary" />;
      } else if (item.type === "topic") {
        icon = <FolderTree className="h-4 w-4 text-blue-600" />;
      } else if (item.type === "subtopic") {
        icon = <FileText className="h-4 w-4 text-green-600" />;
      }

      return (
        <div
          className="flex items-center gap-2"
          style={{ paddingLeft: `${depth * 2}rem` }}
        >
          {icon}
          <span className="font-medium">{item.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "examType",
    header: "EXAM TYPE",
    cell: ({ row }) => {
      const item = row.original;
      if (item.type === "subject") {
        return (item as SubjectRow).examType || "N/A";
      }
      return null;
    },
  },
  {
    id: "count",
    header: "COUNT",
    cell: ({ row }) => {
      const item = row.original;
      if (item.type === "subject") {
        const subject = item as SubjectRow;
        return `${subject.topicsCount} topics`;
      } else if (item.type === "topic") {
        const topic = item as TopicRow;
        return `${topic.subtopicsCount} subtopics`;
      }
      return null;
    },
  },
  {
    accessorKey: "date",
    header: "DATE CREATED",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} onRefresh={onRefresh} />,
  },
];

// Export default columns for backward compatibility
export const columns = createColumns();
