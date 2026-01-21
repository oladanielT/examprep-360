"use client";

import type React from "react";

import { CustomTabs } from "@/components/custom/custom-tab";
import { SetRegularPrice } from "./set-regular-price";
import { SetInstitutionPrice } from "./set-institution-price";
import { CustomDialog } from "@/components/custom/custom-dialog";

interface SetExamPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SetExamPriceDialog({
  open,
  onOpenChange,
}: SetExamPriceDialogProps) {
  return (
    <CustomDialog open={open} onOpenChange={onOpenChange} title="Set Price">
      {
        <CustomTabs
          tabs={[
            {
              value: "regular",
              label: "Regular Users",
              content: <SetRegularPrice />,
            },
            {
              value: "institution",
              label: "Institution License",
              content: <SetInstitutionPrice />,
            },
          ]}
          contentClassName="max-h-[60vh] overflow-y-auto pr-4"
        />
      }
    </CustomDialog>
  );
}
