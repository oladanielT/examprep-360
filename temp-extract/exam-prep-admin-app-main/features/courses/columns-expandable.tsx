"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, ChevronDown, MoreHorizontal, Pencil, Trash2, BookOpen, FolderTree, FileText, Plus, Eye } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { Course, Module, Session } from "./api/course/get-courses";
import { EditCourseDialog } from "./components/edit-course-dialog";
import { useDeleteCourse } from "./api/course/delete-course";
import { useDeleteModule } from "./api/module/delete-module";
import { useDeleteSession } from "./api/session/delete-session";
import { AddModuleDialog } from "./components/add-module-dialog";
import { EditModuleDialog } from "./components/edit-module-dialog";
import { AddSessionDialog } from "./components/add-session-dialog";
import { EditSessionDialog } from "./components/edit-session-dialog";

export type CourseHierarchyType = "course" | "module" | "session";

export interface BaseRow {
  id: string;
  name: string;
  type: CourseHierarchyType;
  date: string;
}

export interface CourseRow extends BaseRow {
  type: "course";
  code: string;
  level: number;
  institutionName: string;
  institutionType: string;
  modulesCount: number;
  modules?: ModuleRow[];
}

export interface ModuleRow extends BaseRow {
  type: "module";
  courseId: string;
  sessionsCount: number;
  sessions?: SessionRow[];
}

export interface SessionRow extends BaseRow {
  type: "session";
  year: string;
  moduleId: string;
}

export type CourseHierarchyRow = CourseRow | ModuleRow | SessionRow;

interface ActionsCellProps {
  row: any;
  onRefresh?: () => void;
}

function ActionsCell({ row, onRefresh }: ActionsCellProps) {
  const item = row.original as CourseHierarchyRow;
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { mutate: deleteCourse, isPending: isDeletingCourse } = useDeleteCourse({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Course deleted successfully");
        setDeleteDialogOpen(false);
        onRefresh?.();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete course");
      },
    },
  });

  const { mutate: deleteModule, isPending: isDeletingModule } = useDeleteModule({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Module deleted successfully");
        setDeleteDialogOpen(false);
        onRefresh?.();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete module");
      },
    },
  });

  const { mutate: deleteSession, isPending: isDeletingSession } = useDeleteSession({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Session deleted successfully");
        setDeleteDialogOpen(false);
        onRefresh?.();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete session");
      },
    },
  });

  const isPending = isDeletingCourse || isDeletingModule || isDeletingSession;

  const handleDelete = () => {
    if (item.type === "course") {
      deleteCourse({ courseId: item.id });
    } else if (item.type === "module") {
      deleteModule({ moduleId: item.id });
    } else if (item.type === "session") {
      deleteSession({ sessionId: item.id });
    }
  };

  const getDeleteMessage = () => {
    if (item.type === "course") {
      const courseItem = item as CourseRow;
      return `Are you sure you want to delete "${courseItem.name}" (${courseItem.code})? This will also delete all modules and sessions in this course. This action cannot be undone.`;
    } else if (item.type === "module") {
      return `Are you sure you want to delete the module "${item.name}"? This will also delete all sessions in this module. This action cannot be undone.`;
    } else {
      const sessionItem = item as SessionRow;
      return `Are you sure you want to delete the session "${sessionItem.year}"? This action cannot be undone.`;
    }
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
            onClick={() => navigator.clipboard.writeText(item.id)}
          >
            Copy {item.type} ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {item.type === "course" && (
            <>
              <DropdownMenuItem
                onClick={() => router.push(`/courses/${item.id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View details
              </DropdownMenuItem>
              <EditCourseDialog
                course={item as any}
                onSuccess={() => {
                  toast.success("Course updated successfully");
                  onRefresh?.();
                }}
              >
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit course
                </DropdownMenuItem>
              </EditCourseDialog>
              <AddModuleDialog
                courseId={item.id}
                onSuccess={() => {
                  toast.success("Module added successfully");
                  onRefresh?.();
                }}
              >
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add module
                </DropdownMenuItem>
              </AddModuleDialog>
            </>
          )}

          {item.type === "module" && (
            <>
              <EditModuleDialog
                module={item as any}
                onSuccess={() => {
                  toast.success("Module updated successfully");
                  onRefresh?.();
                }}
              >
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit module
                </DropdownMenuItem>
              </EditModuleDialog>
              <AddSessionDialog
                moduleId={item.id}
                onSuccess={() => {
                  toast.success("Session added successfully");
                  onRefresh?.();
                }}
              >
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add session
                </DropdownMenuItem>
              </AddSessionDialog>
            </>
          )}

          {item.type === "session" && (
            <EditSessionDialog
              session={item as any}
              onSuccess={() => {
                toast.success("Session updated successfully");
                onRefresh?.();
              }}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit session
              </DropdownMenuItem>
            </EditSessionDialog>
          )}

          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isPending}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete {item.type}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete ${item.type === "course" ? "Course" : item.type === "module" ? "Module" : "Session"}`}
        description={getDeleteMessage()}
        onConfirm={handleDelete}
        variant="destructive"
        confirmText="Delete"
        loading={isPending}
      />
    </>
  );
}

export const createColumns = (onRefresh?: () => void): ColumnDef<CourseHierarchyRow>[] => [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      const item = row.original;

      if (item.type === "session") {
        return <div className="w-6" />;
      }

      if (!row.getCanExpand()) {
        return <div className="w-6" />;
      }

      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={row.getToggleExpandedHandler()}
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      );
    },
  },
  {
    accessorKey: "name",
    header: "NAME",
    cell: ({ row }) => {
      const item = row.original;
      const indent = row.depth * 2;

      const getIcon = () => {
        if (item.type === "course") return <BookOpen className="h-4 w-4 text-muted-foreground" />;
        if (item.type === "module") return <FolderTree className="h-4 w-4 text-muted-foreground" />;
        if (item.type === "session") return <FileText className="h-4 w-4 text-muted-foreground" />;
        return null;
      };

      return (
        <div className="flex items-center gap-2" style={{ paddingLeft: `${indent}rem` }}>
          {getIcon()}
          <span className={item.type !== "course" ? "text-sm text-muted-foreground" : ""}>
            {item.type === "session" ? `Year: ${(item as SessionRow).year}` : item.name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "code",
    header: "CODE",
    cell: ({ row }) => {
      const item = row.original;
      if (item.type === "course") {
        return (item as CourseRow).code;
      }
      return "-";
    },
  },
  {
    accessorKey: "institutionName",
    header: "INSTITUTION",
    cell: ({ row }) => {
      const item = row.original;
      if (item.type === "course") {
        return (item as CourseRow).institutionName;
      }
      return "-";
    },
  },
  {
    accessorKey: "institutionType",
    header: "TYPE",
    cell: ({ row }) => {
      const item = row.original;
      if (item.type === "course") {
        return (item as CourseRow).institutionType;
      }
      return "-";
    },
  },
  {
    accessorKey: "level",
    header: "LEVEL",
    cell: ({ row }) => {
      const item = row.original;
      if (item.type === "course") {
        return (item as CourseRow).level;
      }
      return "-";
    },
  },
  {
    accessorKey: "modulesCount",
    header: "MODULES",
    cell: ({ row }) => {
      const item = row.original;
      if (item.type === "course") {
        return (item as CourseRow).modulesCount;
      }
      return "-";
    },
  },
  {
    accessorKey: "sessionsCount",
    header: "SESSIONS",
    cell: ({ row }) => {
      const item = row.original;
      if (item.type === "module") {
        return (item as ModuleRow).sessionsCount;
      }
      return "-";
    },
  },
  {
    accessorKey: "date",
    header: "DATE",
  },
  {
    id: "actions",
    header: () => <div className="text-right">ACTIONS</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <ActionsCell row={row} onRefresh={onRefresh} />
      </div>
    ),
  },
];
