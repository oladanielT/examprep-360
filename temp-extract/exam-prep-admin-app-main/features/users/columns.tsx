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
import { Student } from "./api/get-students";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ActionsCellProps {
  row: any;
  onRefresh?: () => void;
}

function ActionsCell({ row, onRefresh }: ActionsCellProps) {
  const student = row.original as Student;
  const router = useRouter();

  return (
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
        <DropdownMenuItem onClick={() => router.push(`/users/${student.id}`)}>
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(student.email)}
        >
          Copy Email
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          Suspend User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const createColumns = (onRefresh?: () => void): ColumnDef<Student>[] => [
  {
    accessorKey: "fullName",
    header: "FULL NAME",
  },
  {
    accessorKey: "email",
    header: "EMAIL",
  },
  {
    accessorKey: "phone",
    header: "PHONE NUMBER",
  },
  {
    accessorKey: "examType",
    header: "EXAM TYPE",
  },
  {
    accessorKey: "academicLevel",
    header: "ACADEMIC LEVEL",
  },
  {
    accessorKey: "createdAt",
    header: "DATE JOINED",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return date.toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} onRefresh={onRefresh} />,
  },
];

// Export default columns for backward compatibility
export const columns = createColumns();
