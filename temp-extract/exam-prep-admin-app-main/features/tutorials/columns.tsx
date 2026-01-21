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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Tutorial } from "./api/tutorial/get-all-tutorials";
import { EditTutorialDialog } from "./components/edit-tutorial-dialog";

export type { Tutorial };

// Action cell component that can use hooks
const ActionCell = ({
  tutorial,
  onDelete,
  onUpdate,
}: {
  tutorial: Tutorial;
  onDelete?: (tutorial: Tutorial) => void;
  onUpdate?: () => void;
}) => {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push(`/tutorials/${tutorial.id}`)}
        >
          View Details
        </DropdownMenuItem>
        <EditTutorialDialog
          tutorial={{
            id: tutorial.id,
            name: tutorial.name,
            type: tutorial.type,
            subjectId: tutorial.subjectId,
          }}
          onSuccess={onUpdate}
        >
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit Tutorial
          </DropdownMenuItem>
        </EditTutorialDialog>
        <DropdownMenuItem
          onClick={() => onDelete?.(tutorial)}
          className="text-destructive"
        >
          Delete Tutorial
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const createColumns = (
  onDelete?: (tutorial: Tutorial) => void,
  onUpdate?: () => void
): ColumnDef<Tutorial>[] => [
  {
    accessorKey: "subject.name",
    header: "SUBJECT NAME",
    cell: ({ row }) => {
      return row.original.subject?.name || "-";
    },
  },
  {
    accessorKey: "name",
    header: "TUTORIAL NAME",
  },
  {
    accessorKey: "type",
    header: "TYPE",
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge variant={type === "TEXT_TUTORIAL" ? "default" : "secondary"}>
          {type === "TEXT_TUTORIAL" ? "Text" : "Video"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "_count.chapters",
    header: "CHAPTERS",
    cell: ({ row }) => {
      return row.original._count?.chapters || 0;
    },
  },
  {
    accessorKey: "createdAt",
    header: "DATE",
    cell: ({ row }) => {
      return format(new Date(row.original.createdAt), "MMM dd, yyyy");
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <ActionCell
          tutorial={row.original}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      );
    },
  },
];

// Legacy columns export for backward compatibility
export const columns: ColumnDef<Tutorial>[] = createColumns();
