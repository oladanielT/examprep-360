"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SubTopic } from "@/features/subjects/api/subject/get-subjects";
import { useDeleteSubTopic } from "@/features/subjects/api/sub-topic/delete-sub-topic";
import { EditSubtopicDialog } from "./edit-subtopic-dialog";

interface SubtopicListItemProps {
  subtopic: SubTopic;
  onRefresh?: () => void;
}

export function SubtopicListItem({
  subtopic,
  onRefresh,
}: SubtopicListItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { mutate: deleteSubtopic, isPending: isDeletingSubtopic } = useDeleteSubTopic({
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

  const handleDelete = () => {
    deleteSubtopic({
      subtopicId: subtopic.id,
      topicId: subtopic.topicId,
    });
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/30 transition-colors">
        <span className="text-sm">{subtopic.name}</span>
        <div className="flex items-center gap-1">
          <EditSubtopicDialog subtopic={subtopic} onSuccess={onRefresh}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </EditSubtopicDialog>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subtopic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{subtopic.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingSubtopic}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeletingSubtopic}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeletingSubtopic ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
