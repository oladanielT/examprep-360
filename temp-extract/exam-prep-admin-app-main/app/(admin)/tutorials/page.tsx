"use client";

import { AppSidebarContent, PageHeader } from "@/components/globals";
import TutorialStatsCards from "@/features/tutorials/components/tutorial-stats-card";
import TutorialTable from "@/features/tutorials/components/tutorial-table";
import { AddTutorialDialog } from "@/features/tutorials/components/add-tutorial-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const TutorialPage = () => {
  return (
    <AppSidebarContent>
      <div className="flex items-center justify-between">
        <PageHeader
          name="Tutorials"
          desc="Create and manage tutorials with chapters and content"
        />
        <AddTutorialDialog>
          <Button variant="default" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Tutorial
          </Button>
        </AddTutorialDialog>
      </div>
      <TutorialStatsCards />
      <TutorialTable />
    </AppSidebarContent>
  );
};

export default TutorialPage;
