"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DangerButton from "@/components/buttons/danger-button";
import { ConfirmDialog } from "@/components/custom/custom-dialog";
import { toast } from "sonner";
import { useDeleteExamType } from "../api/exam-types/delete-exam-types";
import { paths } from "@/config/paths";

interface DeleteExamDialogProps {
  examTypeId: string;
  examTypeName: string;
}

export const DeleteExamDialog = ({
  examTypeId,
  examTypeName,
}: DeleteExamDialogProps) => {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { mutate: deleteExam, isPending } = useDeleteExamType({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Exam type deleted successfully");
        setIsDeleteOpen(false);
        // Navigate back to exams list (cache already invalidated and refetched)
        router.push(paths.app.exams.getHref());
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete exam type");
      },
    },
  });

  const handleDelete = () => {
    deleteExam({ examTypeId });
  };

  return (
    <div>
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Exam Type"
        description={`Are you sure you want to delete "${examTypeName}"? This action cannot be undone and will delete all associated subjects, topics, and subtopics.`}
        onConfirm={handleDelete}
        variant="destructive"
        confirmText={isPending ? "Deleting..." : "Delete"}
      />
      <DangerButton
        onClick={() => setIsDeleteOpen(true)}
        title="Delete"
        className="w-40"
        disabled={isPending}
      />
    </div>
  );
};
