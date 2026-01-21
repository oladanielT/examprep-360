"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export type Activity = {
  id: string;
  ipAddress: string;
  action: string;
  date: string;
 
};

export const activityColumns: ColumnDef<Activity>[] = [
  {
    accessorKey: "ipAddress",
    header: "IP ADDRESS ",
  },
  {
    accessorKey: "action",
    header: "ACTION",
  },
 
  {
    accessorKey: "date",
    header: "DATE ",
  },
 
];
