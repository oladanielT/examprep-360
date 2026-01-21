"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Question } from "./api/get-questions";

// Helper function to extract plain text from RichContentBlock[]
const getPlainText = (content: { type: string; value: string }[]): string => {
  if (!content || content.length === 0) return "";
  return content.map((block) => block.value).join(" ");
};

// Helper function to get difficulty color
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "EASY":
      return "bg-green-100 text-green-800";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800";
    case "HARD":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "PUBLISHED":
      return "bg-blue-100 text-blue-800";
    case "DRAFT":
      return "bg-gray-100 text-gray-800";
    case "ARCHIVED":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const columns: ColumnDef<Question>[] = [
  {
    accessorKey: "questionNumber",
    header: "Q#",
    cell: ({ row }) => {
      return <div className="font-medium">#{row.original.questionNumber}</div>;
    },
  },
  {
    accessorKey: "questionText",
    header: "QUESTION",
    cell: ({ row }) => {
      const text = getPlainText(row.original.questionText);
      const truncated = text.length > 80 ? text.substring(0, 80) + "..." : text;
      return <div className="max-w-md">{truncated}</div>;
    },
  },
  {
    accessorKey: "questionType",
    header: "TYPE",
    cell: ({ row }) => {
      const type = row.original.questionType;
      return <div className="text-sm">{type.replace(/_/g, " ")}</div>;
    },
  },
  {
    accessorKey: "difficulty",
    header: "DIFFICULTY",
    cell: ({ row }) => {
      const difficulty = row.original.difficulty;
      return (
        <Badge className={getDifficultyColor(difficulty)} variant="secondary">
          {difficulty}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge className={getStatusColor(status)} variant="secondary">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "marks",
    header: "MARKS",
    cell: ({ row }) => {
      return <div className="text-center">{row.original.marks}</div>;
    },
  },
  {
    id: "year",
    header: "YEAR",
    cell: ({ row }) => {
      const question = row.original;
      // For course questions, check metadata.year or session data
      const year = question.metadata?.year || question.session?.year || "-";
      return <div>{year}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">ACTIONS</div>,
    cell: ({ row }) => {
      const question = row.original;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(question.id)}
              >
                Copy question ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <Eye className="h-4 w-4 mr-2" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Pencil className="h-4 w-4 mr-2" />
                Edit question
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete question
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
