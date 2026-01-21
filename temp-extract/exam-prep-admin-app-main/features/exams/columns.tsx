"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditExamDialog } from "./components/edit-exam-dialog";
import { useState } from "react";
import { useDeleteExamType } from "./api/exam-types/delete-exam-types";
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
import { useRouter } from "next/navigation";

export type Exam = {
  id: string;
  examName: string;
  category: string;
  subjects: string;
  subscribers: string;
  date: string;
};

interface ActionsCellProps {
  row: any;
  onRefresh?: () => void;
}

function ActionsCell({ row, onRefresh }: ActionsCellProps) {
  const exam = row.original as Exam;
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { mutate: deleteExamType, isPending: isDeleting } = useDeleteExamType({
    mutationConfig: {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        onRefresh?.();
      },
    },
  });

  const handleDelete = () => {
    deleteExamType({ examTypeId: exam.id });
  };

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
          <DropdownMenuItem onClick={() => router.push(`/exams/${exam.id}`)}>
            View Details
          </DropdownMenuItem>
          <EditExamDialog
            exam={{
              id: exam.id,
              name: exam.examName,
              category: exam.category,
            }}
            onSuccess={onRefresh}
          >
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Edit Exam
            </DropdownMenuItem>
          </EditExamDialog>
          <DropdownMenuItem
            className="text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              setDeleteDialogOpen(true);
            }}
          >
            Delete Exam
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{exam.examName}"? This action cannot be undone.
              All associated subjects will also be deleted.
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
    </>
  );
}

export const createColumns = (onRefresh?: () => void): ColumnDef<Exam>[] => [
  {
    accessorKey: "examName",
    header: "EXAM NAME",
  },
  {
    accessorKey: "subjects",
    header: "SUBJECTS",
  },
  {
    accessorKey: "subscribers",
    header: "SUBSCRIBERS",
  },
  {
    accessorKey: "date",
    header: "DATE",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} onRefresh={onRefresh} />,
  },
];

// Export default columns for backward compatibility
export const columns = createColumns();
