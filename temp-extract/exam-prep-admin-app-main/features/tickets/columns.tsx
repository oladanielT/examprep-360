"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Ticket = {
  id: string;
  name: string;
  complaint: string;
  email: string;
  phoneNumber: string;
  date: string;
};

export const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "id",
    header: "TICKET ID ",
  },
  {
    accessorKey: "name",
    header: "NAME",
  },
  {
    accessorKey: "complaint",
    header: "COMPLAINT",
  },
  {
    accessorKey: "email",
    header: "EMAIL",
  },
  {
    accessorKey: "phoneNumber",
    header: "PHONE NUMBER",
  },
  {
    accessorKey: "date",
    header: "DATE",
  },
 
];
