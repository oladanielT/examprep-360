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
import { Pen, Loader2, Edit, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SetExamPriceDialog } from "./set-exam-price-dialog";
import { EditExamDialog } from "./edit-exam-dialog";
import { CustomTabs } from "@/components/custom/custom-tab";
import TabExamDetailContent from "./tab-exam-detail-content";
import TabExamSubjectContent from "./tab-exam-subject-content";
import { useExamType } from "../api/exam-types/get-one-exam-types";
import { useDeleteExamType } from "../api/exam-types/delete-exam-types";
import { ExamType } from "../api/exam-types/get-all-exam-types";
import { paths } from "@/config/paths";
import { useQueryClient } from "@tanstack/react-query";

interface ExamsDetailProps {
  examTypeId: string;
}

const ExamsDetail = ({ examTypeId }: ExamsDetailProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingState, setIsDeletingState] = useState(false);

  const {
    data: examType,
    isLoading,
    error,
    refetch,
  } = useExamType({
    examTypeId,
    queryConfig: {
      enabled: !isDeletingState, // Disable query when deleting to prevent refetch
    },
  }) as {
    data: ExamType | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };

  const { mutate: deleteExamType, isPending: isDeleting } = useDeleteExamType({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Exam type deleted successfully");
        setDeleteDialogOpen(false);
        setIsDeletingState(true); // Disable query immediately

        // Remove the specific exam type query to prevent 404
        queryClient.removeQueries({ queryKey: ["exam-types", examTypeId] });
        queryClient.removeQueries({ queryKey: ["exam-types"] });

        // Use replace instead of push to avoid keeping deleted page in history
        router.replace(paths.app.exams.getHref());
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete exam type");
        setIsDeletingState(false); // Re-enable query on error
      },
    },
  });

  const handleDelete = () => {
    deleteExamType({ examTypeId });
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
          <p className="text-destructive">Failed to load exam details</p>
          <p className="text-sm mt-2">Error: {error?.message}</p>
        </Card>
      </div>
    );
  }

  if (!examType) {
    return (
      <div className="space-y-5 py-5">
        <Card className="p-6">
          <p className="text-muted-foreground">No data available</p>
        </Card>
      </div>
    );
  }

  const subjectsCount = examType.subjects?.length || 0;

  return (
    <div className=" space-y-5 py-5">
      <div className="flex items-center justify-between pl-6">
        <h6 className="font-semibold text-lg">Exams details</h6>
        <div className="flex items-center gap-3">
          <EditExamDialog
            exam={{
              id: examType.id,
              name: examType.name,
              category: examType.category,
            }}
            onSuccess={refetch}
          >
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </EditExamDialog>
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
      <Card className=" p-6  space-y-4 bg-[#FCFFF5]">
        <h6 className="    font-semibold text-xl">{examType.name}</h6>
        <div className=" flex gap-6 ">
          <SmallStatsCard
            showMenu={false}
            containerClassName="bg-sidebar-primary  w-48  border-none"
            className=" flex flex-col-reverse  gap-3"
            title="Price"
            amount="N5000"
            icon={Pen}
            onIconClick={() => setDialogOpen(true)}
          />
          <SmallStatsCard
            showMenu={false}
            containerClassName="bg-sidebar-primary  w-48  border-none"
            className=" flex flex-col-reverse  gap-3"
            title="Number of Subjects"
            amount={subjectsCount.toString()}
          />
          <SmallStatsCard
            showMenu={false}
            containerClassName="bg-sidebar-primary  w-48  border-none"
            className=" flex flex-col-reverse  gap-3"
            title="Total Subscribers"
            amount="0"
          />
        </div>
      </Card>
      <Card className="p-6 space-y-4 ">
        <h6 className="text-xl">Exam Information</h6>
        <CustomTabs
          triggerClassName="data-[state=active]:border-0 text-base  text-gray-400  !font-normal  data-[state=active]:text-black px-0  data-[state=active]:!font-medium "
          tabs={[
            {
              value: "details",
              label: "Details",
              content: <TabExamDetailContent examType={examType} />,
            },
            {
              value: "subjects",
              label: "Subjects",
              content: <TabExamSubjectContent examTypeId={examTypeId} />,
            },
          ]}
        />
      </Card>
      <SetExamPriceDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{examType.name}"? This action
              cannot be undone and will delete all associated subjects, topics,
              and subtopics.
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

export default ExamsDetail;
