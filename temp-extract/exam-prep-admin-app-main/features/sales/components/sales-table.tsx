"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ExternalLink, Filter, FilterIcon, SearchIcon } from "lucide-react";
import React, { useState } from "react";

import { DataTable } from "@/components/tables/data-table";
import { TablePagination } from "@/components/tables/table-pagination";
import { columns, Sale } from "../../home/columns";

import { Badge } from "@/components/ui/badge";
import { TransactionDetailsSheet } from "../../home/components/transaction-detail-sheet";

import { TableTabs } from "@/components/tables/table-tabs";
import PrimaryButton from "@/components/buttons/primary-button";
import { AssignManuallyDialog } from "./assign-manually-dialog";
import { paths } from "@/config/paths";
import { FilterDialog } from "@/features/home/components/home-table-filter";
import { SearchInput } from "@/components/globals/search-input";

const SalesTable = () => {
  const ENTRIES_PER_PAGE = 10;

  return (
    <Card className="mt-10 p-2">
      <CardHeader className="border-b-0 justify-start">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Sales
        </CardTitle>
        <div className="flex items-center gap-5 ml-32">
          <SearchInput placeholder="Search..." />
          <FilterDialog>
            <Button variant="outline" size="lg">
              <Filter />
              Filter
            </Button>
          </FilterDialog>
        </div>
        <AssignManuallyDialog>
          <PrimaryButton
            title="Manual Allocation"
            className="my-auto ml-auto"
          />
        </AssignManuallyDialog>
      </CardHeader>
      <CardContent className="border-0 ">
        <TableTabs tabs={salesTabs} baseUrl={paths.app.sales.path} />

        <div className="pt-10">
          <DataTable columns={columns} data={mockSalesData} />
        </div>
      </CardContent>
      <CardFooter className="border-t-0">
        <TablePagination
          totalEntries={mockSalesData.length}
          entriesPerPage={ENTRIES_PER_PAGE}
        />
      </CardFooter>
    </Card>
  );
};

export default SalesTable;
const salesTabs = [
  // Each href is the query string to apply
  { title: "All Sales", href: "?filter=all" },
  { title: "Completed", href: "?filter=completed" },
  { title: "Pending", href: "?filter=pending" },
  { title: "Failed", href: "?filter=failed" },
];

export const mockSalesData: Sale[] = [
  {
    id: "TRX001",
    customerName: "Aisha Mohammed",
    amount: "15000.00",
    examName: "WAEC 2025",
    status: "completed",
    date: "2025-10-10",
  },
  {
    id: "TRX002",
    customerName: "Chinedu Okoro",
    amount: "7500.50",
    examName: "JAMB UTME",
    status: "pending",
    date: "2025-10-10",
  },
  {
    id: "TRX003",
    customerName: "Bayo Adekunle",
    amount: "2200.00",
    examName: "Common Entrance",
    status: "completed",
    date: "2025-10-09",
  },
  {
    id: "TRX004",
    customerName: "Fatima Yusuf",
    amount: "45000.00",
    examName: "ICAN Pro Level 1",
    status: "failed",
    date: "2025-10-08",
  },
  {
    id: "TRX005",
    customerName: "Osas Igbinedion",
    amount: "12000.00",
    examName: "NECO 2025",
    status: "completed",
    date: "2025-10-08",
  },
  {
    id: "TRX006",
    customerName: "Damilola Coker",
    amount: "999.99",
    examName: "Digital Marketing Cert.",
    status: "completed",
    date: "2025-10-07",
  },
  {
    id: "TRX007",
    customerName: "Ngozi Eze",
    amount: "18000.00",
    examName: "GMAT Prep Course",
    status: "pending",
    date: "2025-10-06",
  },
  {
    id: "TRX008",
    customerName: "Toluwani Ajayi",
    amount: "3500.00",
    examName: "Python Basics",
    status: "completed",
    date: "2025-10-06",
  },
  {
    id: "TRX009",
    customerName: "Elias Audu",
    amount: "60000.00",
    examName: "PMP Certification",
    status: "failed",
    date: "2025-10-05",
  },
  {
    id: "TRX010",
    customerName: "Precious Idahosa",
    amount: "5000.00",
    examName: "IELTS Practice Test",
    status: "completed",
    date: "2025-10-05",
  },
];
