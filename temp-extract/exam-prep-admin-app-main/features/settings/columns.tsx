"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export type Administrator = {
  id: string;
  name: string;
  email: string;
  date: string;
  permission: string;
 
};

export const columns: ColumnDef<Administrator>[] = [
  {
    accessorKey: "name",
    header: "NAME ",
  },
  {
    accessorKey: "email",
    header: "EMAIL",
  },
 
  {
    accessorKey: "date",
    header: "DATE ADDED",
  },
  {
    accessorKey: "permission",
    header: "PERMISSION",
  },
  {
    id: "actions",
    cell: ({ row }) => {

      return (
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className=" text-red-400">Remove Admin</span>
            </Button>
       
      );
    },
  },
];
