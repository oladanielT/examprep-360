"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/custom/custom-dialog";
import { toast } from "sonner";
import { useState } from "react";
import { Course } from "./api/course/get-courses";
import { EditCourseDialog } from "./components/edit-course-dialog";
import { useDeleteCourse } from "./api/course/delete-course";

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "code",
    header: "COURSE CODE",
  },
  {
    accessorKey: "name",
    header: "COURSE NAME",
  },
  {
    accessorKey: "department.university.name",
    header: "INSTITUTION NAME",
  },
  {
    accessorKey: "department.university.type",
    header: "INSTITUTION TYPE",
  },
  {
    accessorKey: "level",
    header: "LEVEL",
  },
  {
    accessorKey: "createdAt",
    header: "DATE",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const course = row.original;

      return <CourseActions course={course} />;
    },
  },
];

function CourseActions({ course }: { course: Course }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { mutate: deleteCourse, isPending } = useDeleteCourse({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Course deleted successfully");
        setDeleteDialogOpen(false);
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete course");
      },
    },
  });

  const handleDelete = () => {
    deleteCourse({ courseId: course.id });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(course.id)}
          >
            Copy course ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <EditCourseDialog
            course={course}
            onSuccess={() => {
              toast.success("Course updated successfully");
            }}
          >
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit course
            </DropdownMenuItem>
          </EditCourseDialog>
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isPending}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete course
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Course"
        description={`Are you sure you want to delete "${course.name}" (${course.code})? This action cannot be undone.`}
        onConfirm={handleDelete}
        variant="destructive"
        confirmText="Delete"
        loading={isPending}
      />
    </>
  );
}
