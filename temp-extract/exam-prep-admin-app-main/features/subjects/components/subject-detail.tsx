"use client";

import { SmallStatsCard } from "@/components/cards/small-stats-card";
import { Card } from "@/components/ui/card";
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
import { Edit, Trash2, Loader2, ListChecks } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import TabSubjectDetailContent from "./tab-subject-detail-content";
import { useSubject } from "../api/subject/get-subject";
import { useDeleteSubject } from "../api/subject/delete-subject";
import { Subject } from "../api/subject/get-subjects";
import { EditSubjectDialog } from "./edit-subject-dialog";
import { paths } from "@/config/paths";
import { TopicsSubtopicsSection } from "./topics-subtopics-section";

interface SubjectsDetailProps {
  subjectId: string;
}

const SubjectsDetail = ({ subjectId }: SubjectsDetailProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingState, setIsDeletingState] = useState(false);

  const {
    data: subject,
    isLoading,
    error,
    refetch,
  } = useSubject({
    subjectId,
    queryConfig: {
      enabled: !isDeletingState, // Disable query when deleting to prevent refetch
    },
  }) as {
    data: Subject | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };

  const { mutate: deleteSubject, isPending: isDeleting } = useDeleteSubject({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Subject deleted successfully");
        setDeleteDialogOpen(false);
        setIsDeletingState(true); // Disable query immediately

        // Remove the specific subject query to prevent 404
        queryClient.removeQueries({ queryKey: ["subjects", subjectId] });
        queryClient.removeQueries({ queryKey: ["subjects"] });

        // Use replace instead of push to avoid keeping deleted page in history
        router.replace(paths.app.subjects.getHref());
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete subject");
        setIsDeletingState(false); // Re-enable query on error
      },
    },
  });

  const handleDelete = () => {
    if (subject) {
      deleteSubject({
        subjectId: subject.id,
        examTypeId: subject.examTypeId,
        year: subject.year,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5 py-5">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5 py-5">
        <Card className="p-6">
          <p className="text-destructive">Failed to load subject details</p>
          <p className="text-sm mt-2">Error: {error?.message}</p>
        </Card>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="space-y-5 py-5">
        <Card className="p-6">
          <p className="text-muted-foreground">No subject data available</p>
        </Card>
      </div>
    );
  }

  const topicsCount = subject.topics?.length || 0;
  const subtopicsCount =
    subject.topics?.reduce(
      (total, topic) => total + (topic.subTopics?.length || 0),
      0
    ) || 0;

  return (
    <div className="space-y-5 py-5">
      <div className="flex items-center justify-between pl-6">
        <h6 className="font-semibold text-lg">Subject details</h6>
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            className="gap-2"
            onClick={() => router.push(`/subjects/${subject.id}/questions`)}
          >
            <ListChecks className="h-4 w-4" />
            Manage Questions
          </Button>
          <EditSubjectDialog
            subject={{
              id: subject.id,
              name: subject.name,
              examTypeId: subject.examTypeId,
              year: subject.year,
              paper: subject.paper,
              createdAt: subject.createdAt,
              updatedAt: subject.updatedAt,
            }}
            onSuccess={refetch}
          >
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </EditSubjectDialog>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      <Card className="p-6 space-y-4 bg-[#FCFFF5]">
        <div className="flex items-center justify-between">
          <h6 className="font-semibold text-xl">{subject.name}</h6>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>{subject.examType?.name}</span>
            {subject.year && <span>• {subject.year}</span>}
            {subject.paper && <span>• {subject.paper}</span>}
          </div>
        </div>
        <div className="flex gap-6">
          <SmallStatsCard
            showMenu={false}
            containerClassName="bg-sidebar-primary w-48 border-none"
            className="flex flex-col-reverse gap-3"
            title="Topics"
            amount={topicsCount.toString()}
          />
          <SmallStatsCard
            showMenu={false}
            containerClassName="bg-sidebar-primary w-48 border-none"
            className="flex flex-col-reverse gap-3"
            title="Subtopics"
            amount={subtopicsCount.toString()}
          />
        </div>
      </Card>
      <Card className="p-6 space-y-4">
        <h6 className="text-xl">Subject Information</h6>
        <TabSubjectDetailContent subject={subject} />
      </Card>

      {/* Topics & Subtopics Section */}
      <TopicsSubtopicsSection subject={subject} onRefresh={refetch} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{subject.name}"? This action
              cannot be undone and will delete all associated topics and
              subtopics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
    </div>
  );
};

export default SubjectsDetail;
