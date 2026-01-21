"use client";

import { SmallStatsCard } from "@/components/cards/small-stats-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/custom/custom-dialog";
import { Edit, Trash2, Loader2, ListChecks } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import TabCourseDetailContent from "./tab-course-detail-content";
import { useCourse } from "../api/course/get-course";
import { useDeleteCourse } from "../api/course/delete-course";
import { Course } from "../api/course/get-courses";
import { EditCourseDialog } from "./edit-course-dialog";
import { paths } from "@/config/paths";
import { ModulesSessionsSection } from "./modules-sessions-section";

interface CourseDetailProps {
  courseId: string;
}

const CourseDetail = ({ courseId }: CourseDetailProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingState, setIsDeletingState] = useState(false);

  const {
    data: course,
    isLoading,
    error,
    refetch,
  } = useCourse({
    courseId,
    queryConfig: {
      enabled: !isDeletingState, // Disable query when deleting to prevent refetch
      retry: false, // Don't retry on 404
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch on remount
    },
  }) as {
    data: Course | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };

  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse({
    mutationConfig: {
      onSuccess: async () => {
        toast.success("Course deleted successfully");
        setDeleteDialogOpen(false);

        // Cancel any ongoing queries for this course
        await queryClient.cancelQueries({ queryKey: ["courses", courseId] });

        // Remove the specific course query to prevent 404
        queryClient.removeQueries({ queryKey: ["courses", courseId] });
        queryClient.removeQueries({ queryKey: ["courses"] });

        // Use replace instead of push to avoid keeping deleted page in history
        router.replace(paths.app.courses.getHref());
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete course");
        setIsDeletingState(false); // Re-enable query on error
      },
    },
  });

  const handleDelete = () => {
    if (course) {
      // Disable query immediately before deleting
      setIsDeletingState(true);
      deleteCourse({ courseId: course.id });
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
          <p className="text-destructive">Failed to load course details</p>
          <p className="text-sm mt-2">Error: {error?.message}</p>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-5 py-5">
        <Card className="p-6">
          <p className="text-muted-foreground">No course data available</p>
        </Card>
      </div>
    );
  }

  const modulesCount = course.modules?.length || 0;
  const sessionsCount =
    course.modules?.reduce(
      (total, module) => total + (module.sessions?.length || 0),
      0
    ) || 0;

  return (
    <div className="space-y-5 py-5">
      <div className="flex items-center justify-between pl-6">
        <h6 className="font-semibold text-lg">Course details</h6>
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            className="gap-2"
            onClick={() => router.push(`/courses/${course.id}/questions`)}
          >
            <ListChecks className="h-4 w-4" />
            Manage Questions
          </Button>
          <EditCourseDialog
            course={{
              id: course.id,
              name: course.name,
              code: course.code,
              level: course.level,
              departmentId: course.departmentId,
            }}
            onSuccess={refetch}
          >
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </EditCourseDialog>
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
          <h6 className="font-semibold text-xl">{course.name}</h6>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>{course.code}</span>
            <span>• Level {course.level}</span>
          </div>
        </div>
        <div className="flex gap-6">
          <SmallStatsCard
            showMenu={false}
            containerClassName="bg-sidebar-primary w-48 border-none"
            className="flex flex-col-reverse gap-3"
            title="Modules"
            amount={modulesCount.toString()}
          />
          <SmallStatsCard
            showMenu={false}
            containerClassName="bg-sidebar-primary w-48 border-none"
            className="flex flex-col-reverse gap-3"
            title="Sessions"
            amount={sessionsCount.toString()}
          />
        </div>
      </Card>
      <Card className="p-6 space-y-4">
        <h6 className="text-xl">Course Information</h6>
        <TabCourseDetailContent course={course} />
      </Card>

      {/* Modules & Sessions Section */}
      <ModulesSessionsSection course={course} onRefresh={refetch} />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Course"
        description={`Are you sure you want to delete "${course.name}" (${course.code})? This action cannot be undone and will delete all associated modules and sessions.`}
        onConfirm={handleDelete}
        variant="destructive"
        confirmText="Delete"
        loading={isDeleting}
      />
    </div>
  );
};

export default CourseDetail;
