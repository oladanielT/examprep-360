"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/base-badge";
import { Checkbox } from "@/components/ui/checkbox";

export type Sale = {
  id: string;
  customerName: string;
  amount: string;
  examName: string;
  status: "pending" | "completed" | "failed";
  date: string;
};

export const formatNaira = (amountString: string) => {
  try {
    const amount = parseFloat(amountString);
    if (isNaN(amount)) return amountString; // Return original if not a valid number

    // Using Intl.NumberFormat for accurate currency formatting
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN", // Nigerian Naira
    }).format(amount);
  } catch (error) {
    return amountString;
  }
};

export const columns: ColumnDef<Sale>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    ),
  },
  {
    accessorKey: "id",
    header: "Sales ID",
  },
  {
    accessorKey: "customerName",
    header: "Customer Name",
  },
  {
    accessorKey: "examName",
    header: "Exam Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Sale["status"];

      const getStatusVariant = (status: Sale["status"]) => {
        switch (status) {
          case "completed":
            return "success";
          case "pending":
            return "warning";
          case "failed":
            return "destructive";
          default:
            return "primary";
        }
      };

      return (
        <Badge
          variant={getStatusVariant(status)}
          className="capitalize text-white"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = row.getValue("amount") as string;
      const formatted = formatNaira(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },

  {
    accessorKey: "date",
    header: "Date",
  },
];
