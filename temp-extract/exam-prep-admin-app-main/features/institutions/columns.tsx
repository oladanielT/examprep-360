"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, ChevronDown, MoreHorizontal, Building2, School, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddFacultyDialog } from "./components/add-faculty-dialog";
import { EditFacultyDialog } from "./components/edit-faculty-dialog";
import { AddDepartmentDialog } from "./components/add-department-dialog";
import { EditDepartmentDialog } from "./components/edit-department-dialog";
import { EditUniversityDialog } from "./components/edit-university-dialog";
import { DeleteConfirmationDialog } from "./components/delete-confirmation-dialog";
import { useDeleteUniversity } from "./api/university/delete-university";
import { useDeleteFaculty } from "./api/faculty/delete-faculty";
import { useDeleteDepartment } from "./api/department/delete-department";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type HierarchyRowType = "university" | "faculty" | "department";

export interface BaseRow {
  id: string;
  name: string;
  type: HierarchyRowType;
  date: string;
}

export interface UniversityRow extends BaseRow {
  type: "university";
  acronym: string;
  schoolType: "UNIVERSITY" | "COLLEGE" | "POLYTECHNIC";
  coursesCount: number;
  faculties?: FacultyRow[];
  imageUrl?: string | null;
}

export interface FacultyRow extends BaseRow {
  type: "faculty";
  universityId: string;
  coursesCount: number;
  departments?: DepartmentRow[];
}

export interface DepartmentRow extends BaseRow {
  type: "department";
  facultyId: string;
  coursesCount: number;
}

export type InstitutionRow = UniversityRow | FacultyRow | DepartmentRow;

interface ActionsCell {
  row: any;
  onRefresh?: () => void;
}

function ActionsCell({ row, onRefresh }: ActionsCell) {
  const institution = row.original as InstitutionRow;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const { mutate: deleteUniversity, isPending: isDeletingUniversity } = useDeleteUniversity({
    mutationConfig: {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        onRefresh?.();
      },
    },
  });
  const { mutate: deleteFaculty, isPending: isDeletingFaculty } = useDeleteFaculty({
    mutationConfig: {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        onRefresh?.();
      },
    },
  });
  const { mutate: deleteDepartment, isPending: isDeletingDepartment } = useDeleteDepartment({
    mutationConfig: {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        onRefresh?.();
      },
    },
  });

  const isDeleting = isDeletingUniversity || isDeletingFaculty || isDeletingDepartment;

  const handleDelete = () => {
    if (institution.type === "university") {
      deleteUniversity({ universityId: institution.id });
    } else if (institution.type === "faculty") {
      const faculty = institution as FacultyRow;
      deleteFaculty({ facultyId: faculty.id, universityId: faculty.universityId });
    } else if (institution.type === "department") {
      const department = institution as DepartmentRow;
      deleteDepartment({ departmentId: department.id, facultyId: department.facultyId });
    }
  };

  const getDeleteDialogContent = () => {
    const typeLabel = institution.type === "university"
      ? "institution"
      : institution.type;

    return {
      title: `Delete ${typeLabel}`,
      description: `Are you sure you want to delete "${institution.name}"? This action cannot be undone.${
        institution.type === "university"
          ? " All associated faculties and departments will also be deleted."
          : institution.type === "faculty"
          ? " All associated departments will also be deleted."
          : ""
      }`,
    };
  };

  if (institution.type === "university") {
    const university = institution as UniversityRow;
    const dialogContent = getDeleteDialogContent();

    return (
      <>
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
            <DropdownMenuItem onClick={() => router.push(`/institutions/${university.id}`)}>
              View Details
            </DropdownMenuItem>
            <AddFacultyDialog universityId={university.id} onSuccess={onRefresh}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Add Faculty
              </DropdownMenuItem>
            </AddFacultyDialog>
            <EditUniversityDialog
              university={{
                id: university.id,
                name: university.name,
                acronym: university.acronym,
                type: university.schoolType,
                imageUrl: university.imageUrl,
              }}
              onSuccess={onRefresh}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Edit Institution
              </DropdownMenuItem>
            </EditUniversityDialog>
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive"
            >
              Delete Institution
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          title={dialogContent.title}
          description={dialogContent.description}
          isDeleting={isDeleting}
        />
      </>
    );
  }

  if (institution.type === "faculty") {
    const faculty = institution as FacultyRow;
    const dialogContent = getDeleteDialogContent();

    return (
      <>
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
            <AddDepartmentDialog facultyId={faculty.id} onSuccess={onRefresh}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Add Department
              </DropdownMenuItem>
            </AddDepartmentDialog>
            <EditFacultyDialog
              faculty={{
                id: faculty.id,
                name: faculty.name,
                universityId: faculty.universityId,
              }}
              onSuccess={onRefresh}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Edit Faculty
              </DropdownMenuItem>
            </EditFacultyDialog>
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive"
            >
              Delete Faculty
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          title={dialogContent.title}
          description={dialogContent.description}
          isDeleting={isDeleting}
        />
      </>
    );
  }

  if (institution.type === "department") {
    const department = institution as DepartmentRow;
    const dialogContent = getDeleteDialogContent();

    return (
      <>
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
            <EditDepartmentDialog
              department={{
                id: department.id,
                name: department.name,
                facultyId: department.facultyId,
              }}
              onSuccess={onRefresh}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Edit Department
              </DropdownMenuItem>
            </EditDepartmentDialog>
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive"
            >
              Delete Department
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          title={dialogContent.title}
          description={dialogContent.description}
          isDeleting={isDeleting}
        />
      </>
    );
  }

  return null;
}

export const createColumns = (onRefresh?: () => void): ColumnDef<InstitutionRow>[] => [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      const institution = row.original;

      // Departments can't expand, so show nothing
      if (institution.type === "department") {
        return <div className="w-4" />;
      }

      // Check if there are actual children
      let hasChildren = false;
      if (institution.type === "university") {
        const university = institution as UniversityRow;
        hasChildren = (university.faculties?.length || 0) > 0;
      } else if (institution.type === "faculty") {
        const faculty = institution as FacultyRow;
        hasChildren = (faculty.departments?.length || 0) > 0;
      }

      // Only show expander if there are children
      if (hasChildren) {
        return (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={(e) => {
              e.stopPropagation();
              row.getToggleExpandedHandler()();
            }}
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        );
      }

      return <div className="w-4" />;
    },
    size: 40,
  },
  {
    accessorKey: "name",
    header: "NAME",
    cell: ({ row }) => {
      const institution = row.original;
      const depth = row.depth;

      let icon = null;
      if (institution.type === "university") {
        icon = <Building2 className="h-4 w-4 text-primary" />;
      } else if (institution.type === "faculty") {
        icon = <School className="h-4 w-4 text-blue-600" />;
      } else if (institution.type === "department") {
        icon = <GraduationCap className="h-4 w-4 text-green-600" />;
      }

      return (
        <div
          className="flex items-center gap-2"
          style={{ paddingLeft: `${depth * 2}rem` }}
        >
          {icon}
          <span className="font-medium">{institution.name}</span>
          {institution.type === "university" && (
            <span className="text-xs text-muted-foreground">
              ({(institution as UniversityRow).acronym})
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "coursesCount",
    header: "COURSES",
    cell: ({ row }) => {
      const count = row.original.coursesCount || 0;
      return <span>{count}</span>;
    },
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
