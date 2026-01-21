"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronRight,
  ChevronDown,
  FolderTree,
  FileText,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { Course, Module, Session } from "../api/course/get-courses";
import { AddModuleDialog } from "./add-module-dialog";
import { EditModuleDialog } from "./edit-module-dialog";
import { AddSessionDialog } from "./add-session-dialog";
import { EditSessionDialog } from "./edit-session-dialog";
import { ConfirmDialog } from "@/components/custom/custom-dialog";
import { useDeleteModule } from "../api/module/delete-module";
import { useDeleteSession } from "../api/session/delete-session";
import { toast } from "sonner";

interface ModulesSessionsSectionProps {
  course: Course;
  onRefresh: () => void;
}

export function ModulesSessionsSection({
  course,
  onRefresh,
}: ModulesSessionsSectionProps) {
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "module" | "session" | null;
    id: string | null;
    name: string | null;
    moduleId?: string;
  }>({ open: false, type: null, id: null, name: null });

  const { mutate: deleteModule, isPending: isDeletingModule } = useDeleteModule({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Module deleted successfully");
        setDeleteDialog({ open: false, type: null, id: null, name: null });
        onRefresh();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to delete module");
      },
    },
  });

  const { mutate: deleteSession, isPending: isDeletingSession } =
    useDeleteSession({
      mutationConfig: {
        onSuccess: () => {
          toast.success("Session deleted successfully");
          setDeleteDialog({ open: false, type: null, id: null, name: null });
          onRefresh();
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to delete session");
        },
      },
    });

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleDelete = () => {
    if (deleteDialog.type === "module" && deleteDialog.id) {
      deleteModule({ moduleId: deleteDialog.id });
    } else if (
      deleteDialog.type === "session" &&
      deleteDialog.id &&
      deleteDialog.moduleId
    ) {
      deleteSession({ sessionId: deleteDialog.id });
    }
  };

  const getDeleteDialogContent = () => {
    const typeLabel = deleteDialog.type || "";
    return {
      title: `Delete ${typeLabel}`,
      description: `Are you sure you want to delete "${
        deleteDialog.name
      }"? This action cannot be undone.${
        deleteDialog.type === "module"
          ? " All associated sessions will also be deleted."
          : ""
      }`,
    };
  };

  const dialogContent = getDeleteDialogContent();

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h6 className="text-xl font-semibold">Modules & Sessions</h6>
          <AddModuleDialog courseId={course.id} onSuccess={onRefresh}>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Module
            </Button>
          </AddModuleDialog>
        </div>
        {!course.modules?.length ? (
          <p className="text-muted-foreground">No modules added yet</p>
        ) : (
          <div className="space-y-3">
            {course.modules.map((module: Module) => (
              <Collapsible
                key={module.id}
                open={openModules.has(module.id)}
                onOpenChange={() => toggleModule(module.id)}
              >
                <Card className="border-l-4 border-l-blue-600">
                  <div className="flex items-center justify-between p-4">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex-1 justify-start hover:bg-muted/50"
                      >
                        {openModules.has(module.id) ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        <FolderTree className="h-5 w-5 mr-3 text-blue-600" />
                        <span className="font-medium text-base">
                          {module.name}
                        </span>
                        <Badge variant="secondary" className="ml-4">
                          {module.sessions?.length || 0} Sessions
                        </Badge>
                      </Button>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-2">
                      <AddSessionDialog
                        moduleId={module.id}
                        onSuccess={onRefresh}
                      >
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Plus className="h-4 w-4" />
                          <span className="text-xs">Session</span>
                        </Button>
                      </AddSessionDialog>
                      <EditModuleDialog
                        module={module}
                        onSuccess={onRefresh}
                      >
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </EditModuleDialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            type: "module",
                            id: module.id,
                            name: module.name,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-2">
                      {!module.sessions?.length ? (
                        <p className="text-sm text-muted-foreground ml-11">
                          No sessions added yet
                        </p>
                      ) : (
                        module.sessions.map((session: Session) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between ml-11 p-3 rounded-lg bg-muted/50 hover:bg-muted"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">
                                Year: {session.year}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <EditSessionDialog
                                session={session}
                                onSuccess={onRefresh}
                              >
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </EditSessionDialog>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setDeleteDialog({
                                    open: true,
                                    type: "session",
                                    id: session.id,
                                    name: `Year ${session.year}`,
                                    moduleId: module.id,
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, type: null, id: null, name: null })
        }
        title={dialogContent.title}
        description={dialogContent.description}
        onConfirm={handleDelete}
        variant="destructive"
        confirmText="Delete"
        loading={isDeletingModule || isDeletingSession}
      />
    </>
  );
}
