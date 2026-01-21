"use client";
import { SmallStatsCard } from "@/components/cards/small-stats-card";
import { CustomTabs } from "@/components/custom/custom-tab";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, ChevronDown, School, GraduationCap, Loader2, Edit, Trash2, Plus } from "lucide-react";
import React, { useState } from "react";
import TabCourses from "./tab-courses";
import { useUniversity } from "../api/university/get-university";
import { Button } from "@/components/ui/button";
import { University, Faculty, Department } from "../api/university/get-universities";
import { AddFacultyDialog } from "./add-faculty-dialog";
import { EditFacultyDialog } from "./edit-faculty-dialog";
import { AddDepartmentDialog } from "./add-department-dialog";
import { EditDepartmentDialog } from "./edit-department-dialog";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { useDeleteFaculty } from "../api/faculty/delete-faculty";
import { useDeleteDepartment } from "../api/department/delete-department";

interface InstitutionDetailProps {
  universityId: string;
}

export default function InstitutionDetail({ universityId }: InstitutionDetailProps) {
  const { data, isLoading, error, refetch } = useUniversity({ universityId }) as {
    data: any;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  const [openFaculties, setOpenFaculties] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "faculty" | "department" | null;
    id: string | null;
    name: string | null;
    facultyId?: string;
  }>({ open: false, type: null, id: null, name: null });

  const { mutate: deleteFaculty, isPending: isDeletingFaculty } = useDeleteFaculty({
    mutationConfig: {
      onSuccess: () => {
        setDeleteDialog({ open: false, type: null, id: null, name: null });
        refetch();
      },
    },
  });

  const { mutate: deleteDepartment, isPending: isDeletingDepartment } = useDeleteDepartment({
    mutationConfig: {
      onSuccess: () => {
        setDeleteDialog({ open: false, type: null, id: null, name: null });
        refetch();
      },
    },
  });

  const toggleFaculty = (facultyId: string) => {
    setOpenFaculties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(facultyId)) {
        newSet.delete(facultyId);
      } else {
        newSet.add(facultyId);
      }
      return newSet;
    });
  };

  const handleDelete = () => {
    if (deleteDialog.type === "faculty" && deleteDialog.id) {
      deleteFaculty({ facultyId: deleteDialog.id, universityId });
    } else if (deleteDialog.type === "department" && deleteDialog.id && deleteDialog.facultyId) {
      deleteDepartment({ departmentId: deleteDialog.id, facultyId: deleteDialog.facultyId });
    }
  };

  const handleRefresh = () => {
    refetch();
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
          <p className="text-destructive">Failed to load institution details</p>
          <p className="text-sm mt-2">Error: {error?.message}</p>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-5 py-5">
        <Card className="p-6">
          <p className="text-muted-foreground">No data available</p>
        </Card>
      </div>
    );
  }

  // Check if data has a .data property (wrapped) or is the university directly
  const university = data.data || data;
  const facultiesCount = university.faculties?.length || 0;
  const departmentsCount =
    university.faculties?.reduce((acc: number, faculty: Faculty) => acc + (faculty.departments?.length || 0), 0) || 0;

  return (
    <div className="space-y-5 py-5">
      <div className="flex justify-between items-center">
        <h6 className="pl-6 font-semibold text-lg">Institution details</h6>
      </div>

      {/* Header Card */}
      <Card className="p-6 space-y-4 bg-[#FCFFF5]">
        <div className="flex items-center gap-3">
          <h6 className="font-semibold text-xl">{university.name}</h6>
          <Badge variant="outline">{university.acronym}</Badge>
          <Badge>{university.type}</Badge>
        </div>
        <div className="flex gap-6">
          <SmallStatsCard
            showMenu={false}
            containerClassName="bg-sidebar-primary w-48 border-none"
            className="flex flex-col-reverse gap-3"
            title="Faculties"
            amount={facultiesCount.toString()}
          />
          <SmallStatsCard
            showMenu={false}
            containerClassName="bg-blue-500 w-48 border-none"
            className="flex flex-col-reverse gap-3"
            title="Departments"
            amount={departmentsCount.toString()}
          />
          <SmallStatsCard
            showMenu={false}
            containerClassName="bg-green-500 w-48 border-none"
            className="flex flex-col-reverse gap-3"
            title="Courses"
            amount="0"
          />
        </div>
      </Card>

      {/* Faculties & Departments */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h6 className="text-xl font-semibold">Faculties & Departments</h6>
          <AddFacultyDialog universityId={universityId} onSuccess={handleRefresh}>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Faculty
            </Button>
          </AddFacultyDialog>
        </div>
        {!university.faculties?.length ? (
          <p className="text-muted-foreground">No faculties added yet</p>
        ) : (
          <div className="space-y-3">
            {university.faculties.map((faculty: Faculty) => (
              <Collapsible
                key={faculty.id}
                open={openFaculties.has(faculty.id)}
                onOpenChange={() => toggleFaculty(faculty.id)}
              >
                <Card className="border-l-4 border-l-primary">
                  <div className="flex items-center justify-between p-4">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex-1 justify-start hover:bg-muted/50"
                      >
                        {openFaculties.has(faculty.id) ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        <School className="h-5 w-5 mr-3 text-primary" />
                        <span className="font-medium text-base">{faculty.name}</span>
                        <Badge variant="secondary" className="ml-4">
                          {faculty.departments?.length || 0} Departments
                        </Badge>
                      </Button>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-2">
                      <AddDepartmentDialog facultyId={faculty.id} onSuccess={handleRefresh}>
                        <Button variant="outline" size="sm" className="gap-1" onClick={(e) => e.stopPropagation()}>
                          <Plus className="h-3 w-3" />
                          Add Dept
                        </Button>
                      </AddDepartmentDialog>
                      <EditFacultyDialog
                        faculty={{
                          id: faculty.id,
                          name: faculty.name,
                          universityId,
                        }}
                        onSuccess={handleRefresh}
                      >
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </EditFacultyDialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDialog({
                            open: true,
                            type: "faculty",
                            id: faculty.id,
                            name: faculty.name,
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-2">
                      {!faculty.departments?.length ? (
                        <p className="text-sm text-muted-foreground pl-9">
                          No departments added yet
                        </p>
                      ) : (
                        faculty.departments.map((department: Department) => (
                          <div
                            key={department.id}
                            className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/30 ml-9"
                          >
                            <div className="flex items-center gap-3">
                              <GraduationCap className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{department.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <EditDepartmentDialog
                                department={{
                                  id: department.id,
                                  name: department.name,
                                  facultyId: faculty.id,
                                }}
                                onSuccess={handleRefresh}
                              >
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </EditDepartmentDialog>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  setDeleteDialog({
                                    open: true,
                                    type: "department",
                                    id: department.id,
                                    name: department.name,
                                    facultyId: faculty.id,
                                  });
                                }}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </Card>

      {/* Courses Tab */}
      <Card className="p-6 space-y-4">
        <h6 className="text-xl">Institution Information</h6>
        <CustomTabs
          triggerClassName="data-[state=active]:border-0 text-base text-gray-400 !font-normal data-[state=active]:text-black px-0 data-[state=active]:!font-medium"
          tabs={[
            {
              value: "courses",
              label: "Courses",
              content: <TabCourses />,
            },
          ]}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: null, id: null, name: null })}
        onConfirm={handleDelete}
        title={`Delete ${deleteDialog.type === "faculty" ? "Faculty" : "Department"}`}
        description={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.${
          deleteDialog.type === "faculty" ? " All associated departments will also be deleted." : ""
        }`}
        isDeleting={isDeletingFaculty || isDeletingDepartment}
      />
    </div>
  );
}
