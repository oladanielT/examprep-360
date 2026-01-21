"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { Edit, Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Topic, SubTopic } from "@/features/subjects/api/subject/get-subjects";
import { useDeleteTopic } from "@/features/subjects/api/topic/delete-topic";
import { SubtopicListItem } from "./subtopic-list-item";
import { EditTopicDialog } from "./edit-topic-dialog";
import { AddSubtopicDialog } from "./add-subtopic-dialog";

interface TopicCollapsibleItemProps {
  topic: Topic;
  onRefresh?: () => void;
}

export function TopicCollapsibleItem({
  topic,
  onRefresh,
}: TopicCollapsibleItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Use nested subtopics from topic (no API call needed!)
  const subtopics = topic.subTopics || [];

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

  const handleDelete = () => {
    deleteTopic({
      topicId: topic.id,
      subjectId: topic.subjectId,
    });
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="border rounded-lg overflow-hidden">
          {/* Topic Header */}
          <div className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 flex-1 text-left">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">{topic.name}</span>
                <Badge variant="secondary" className="ml-2">
                  {subtopics.length} Subtopics
                </Badge>
              </button>
            </CollapsibleTrigger>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <AddSubtopicDialog topicId={topic.id} onSuccess={onRefresh}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </AddSubtopicDialog>
              <EditTopicDialog topic={topic} onSuccess={onRefresh}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </EditTopicDialog>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          {/* Subtopics List */}
          <CollapsibleContent>
            <div className="p-4 space-y-2 bg-background">
              {!subtopics.length ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No subtopics added yet
                </p>
              ) : (
                subtopics.map((subtopic: SubTopic) => (
                  <SubtopicListItem
                    key={subtopic.id}
                    subtopic={subtopic}
                    onRefresh={onRefresh}
                  />
                ))
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Topic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{topic.name}"? This action cannot be undone and will also delete all associated subtopics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingTopic}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeletingTopic}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeletingTopic ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
