"use client";

import { AddNewButton } from "@/components/buttons/add-new-button";
import { SmallStatsCard } from "@/components/cards/small-stats-card";
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
import { Loader2, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  useSubjects,
  Subject,
  SubjectsResponse,
} from "@/features/subjects/api/subject/get-subjects";
import { useDeleteSubject } from "@/features/subjects/api/subject/delete-subject";
import { AddSubjectDialog } from "@/features/subjects/components/add-subject-dialog";
import { SubjectDetailSheet } from "@/features/subjects/components/subject-detail-sheet";

interface TabExamSubjectContentProps {
  examTypeId: string;
}

const TabExamSubjectContent = ({ examTypeId }: TabExamSubjectContentProps) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    subject: Subject | null;
  }>({ open: false, subject: null });

  // Fetch subjects for this exam type (no year filter - show all subjects)
  const {
    data: subjectsData,
    isLoading: isLoadingSubjects,
    refetch: refetchSubjects,
  } = useSubjects({
    examTypeId,
    page: 1,
    limit: 100,
  }) as {
    data: SubjectsResponse | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  const { mutate: deleteSubject, isPending: isDeletingSubject } =
    useDeleteSubject({
      mutationConfig: {
        onSuccess: () => {
          toast.success("Subject deleted successfully");
          setDeleteDialog({ open: false, subject: null });
          refetchSubjects();
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to delete subject");
        },
      },
    });

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setSheetOpen(true);
  };

  const handleRefresh = () => {
    refetchSubjects();
  };

  const handleDelete = () => {
    if (deleteDialog.subject) {
      deleteSubject({
        subjectId: deleteDialog.subject.id,
        examTypeId: deleteDialog.subject.examTypeId,
        year: deleteDialog.subject.year,
      });
    }
  };

  if (isLoadingSubjects) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const subjects = subjectsData?.data || [];

  return (
    <>
      <div className="grid grid-cols-3 gap-5">
        <AddSubjectDialog examTypeId={examTypeId} onSuccess={handleRefresh}>
          <AddNewButton label="Add New Subject" />
        </AddSubjectDialog>
        {subjects.map((subject: Subject) => (
          <div key={subject.id} className="cursor-pointer group relative">
            <div onClick={() => handleSubjectClick(subject)}>
              <SmallStatsCard
                amountClassName="text-lg"
                title={examTypeId.toUpperCase() || "EXAM"}
                amount={subject.name}
                containerClassName="min-h-[140px]"
                showMenu={false}
              />
            </div>
            {/* Action buttons overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteDialog({ open: true, subject });
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Subject Detail Sheet */}
      <SubjectDetailSheet
        subject={selectedSubject}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onRefresh={handleRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, subject: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.subject?.name}"?
              This action cannot be undone and will also delete all associated
              topics and subtopics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingSubject}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeletingSubject}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeletingSubject ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TabExamSubjectContent;
