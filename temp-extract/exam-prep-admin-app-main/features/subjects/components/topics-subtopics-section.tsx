"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronRight,
  ChevronDown,
  FolderTree,
  FileText,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { Subject, Topic, SubTopic } from "../api/subject/get-subjects";
import { AddTopicDialog } from "./add-topic-dialog";
import { EditTopicDialog } from "./edit-topic-dialog";
import { AddSubtopicDialog } from "./add-subtopic-dialog";
import { EditSubtopicDialog } from "./edit-subtopic-dialog";
import { DeleteConfirmationDialog } from "@/features/institutions/components/delete-confirmation-dialog";
import { useDeleteTopic } from "../api/topic/delete-topic";
import { useDeleteSubTopic } from "../api/sub-topic/delete-sub-topic";

interface TopicsSubtopicsSectionProps {
  subject: Subject;
  onRefresh: () => void;
}

export function TopicsSubtopicsSection({
  subject,
  onRefresh,
}: TopicsSubtopicsSectionProps) {
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "topic" | "subtopic" | null;
    id: string | null;
    name: string | null;
    topicId?: string;
  }>({ open: false, type: null, id: null, name: null });

  const { mutate: deleteTopic, isPending: isDeletingTopic } = useDeleteTopic({
    mutationConfig: {
      onSuccess: () => {
        setDeleteDialog({ open: false, type: null, id: null, name: null });
        onRefresh();
      },
    },
  });

  const { mutate: deleteSubtopic, isPending: isDeletingSubtopic } =
    useDeleteSubTopic({
      mutationConfig: {
        onSuccess: () => {
          setDeleteDialog({ open: false, type: null, id: null, name: null });
          onRefresh();
        },
      },
    });

  const toggleTopic = (topicId: string) => {
    setOpenTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const handleDelete = () => {
    if (deleteDialog.type === "topic" && deleteDialog.id) {
      deleteTopic({ topicId: deleteDialog.id, subjectId: subject.id });
    } else if (
      deleteDialog.type === "subtopic" &&
      deleteDialog.id &&
      deleteDialog.topicId
    ) {
      deleteSubtopic({
        subtopicId: deleteDialog.id,
        topicId: deleteDialog.topicId,
      });
    }
  };

  const getDeleteDialogContent = () => {
    const typeLabel = deleteDialog.type || "";
    return {
      title: `Delete ${typeLabel}`,
      description: `Are you sure you want to delete "${
        deleteDialog.name
      }"? This action cannot be undone.${
        deleteDialog.type === "topic"
          ? " All associated subtopics will also be deleted."
          : ""
      }`,
    };
  };

  const dialogContent = getDeleteDialogContent();

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h6 className="text-xl font-semibold">Topics & Subtopics</h6>
          <AddTopicDialog subjectId={subject.id} onSuccess={onRefresh}>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Topic
            </Button>
          </AddTopicDialog>
        </div>
        {!subject.topics?.length ? (
          <p className="text-muted-foreground">No topics added yet</p>
        ) : (
          <div className="space-y-3">
            {subject.topics.map((topic: Topic) => (
              <Collapsible
                key={topic.id}
                open={openTopics.has(topic.id)}
                onOpenChange={() => toggleTopic(topic.id)}
              >
                <Card className="border-l-4 border-l-blue-600">
                  <div className="flex items-center justify-between p-4">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex-1 justify-start hover:bg-muted/50"
                      >
                        {openTopics.has(topic.id) ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        <FolderTree className="h-5 w-5 mr-3 text-blue-600" />
                        <span className="font-medium text-base">
                          {topic.name}
                        </span>
                        <Badge variant="secondary" className="ml-4">
                          {topic.subTopics?.length || 0} Subtopics
                        </Badge>
                      </Button>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-2">
                      <AddSubtopicDialog
                        topicId={topic.id}
                        onSuccess={onRefresh}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Plus className="h-3 w-3" />
                          Add Subtopic
                        </Button>
                      </AddSubtopicDialog>
                      <EditTopicDialog
                        topic={{
                          id: topic.id,
                          name: topic.name,
                          subjectId: subject.id,
                          createdAt: subject.createdAt,
                          updatedAt: subject.updatedAt,
                        }}
                        onSuccess={onRefresh}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </EditTopicDialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDialog({
                            open: true,
                            type: "topic",
                            id: topic.id,
                            name: topic.name,
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-2">
                      {!topic.subTopics?.length ? (
                        <p className="text-sm text-muted-foreground pl-9">
                          No subtopics added yet
                        </p>
                      ) : (
                        topic.subTopics.map((subtopic: SubTopic) => (
                          <div
                            key={subtopic.id}
                            className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/30 ml-9"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{subtopic.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <EditSubtopicDialog
                                subtopic={{
                                  id: subtopic.id,
                                  name: subtopic.name,
                                  topicId: topic.id,
                                  createdAt: subtopic.createdAt,
                                  updatedAt: subtopic.updatedAt,
                                }}
                                onSuccess={onRefresh}
                              >
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
                                onClick={() => {
                                  setDeleteDialog({
                                    open: true,
                                    type: "subtopic",
                                    id: subtopic.id,
                                    name: subtopic.name,
                                    topicId: topic.id,
                                  });
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDelete}
        title={dialogContent.title}
        description={dialogContent.description}
        isDeleting={isDeletingTopic || isDeletingSubtopic}
      />
    </>
  );
}
