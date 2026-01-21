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
import { useDebouncedCallback } from "use-debounce";

import { DataTable } from "@/components/tables/data-table";
import { TablePagination } from "@/components/tables/table-pagination";
import { columns, Sale } from "../columns";
import { FilterDialog } from "./home-table-filter";
import { Badge } from "@/components/ui/badge";
import { TransactionDetailsSheet } from "./transaction-detail-sheet";
import { useHomeFilters } from "../lib/home-url-state";
import { useSearch } from "@/lib/url-state";
import { SearchInput } from "@/components/globals/search-input";

const UsersTable = () => {
  const ENTRIES_PER_PAGE = 10;
  const [selectedTransaction, setSelectedTransaction] = useState<Sale | null>(
    null
  );
  const { activeFilterCount } = useHomeFilters();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleRowClick = (transaction: Sale) => {
    setSelectedTransaction(transaction);
    setSheetOpen(true);
  };
  return (
    <Card className="mt-10 p-2">
      <CardHeader className="border-b-0">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Recent Sales
        </CardTitle>
        <div className="flex items-center gap-5">
          <SearchInput placeholder="Search..." />
          <FilterDialog>
            <Button variant="outline" className="gap-2 bg-transparent">
              <FilterIcon className="size-4" />
              Filter
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </FilterDialog>
        </div>
        <Button variant="ghost" size="icon-lg">
          <ExternalLink />
        </Button>
      </CardHeader>
      <CardContent className="border-0 ">
        <div className="pt-10">
          <DataTable
            columns={columns}
            data={mockSalesData}
            onRowClick={(row) => {
              const rowData = row.original;
              handleRowClick(rowData);
            }}
          />
        </div>
      </CardContent>
      <CardFooter className="border-t-0">
        <TablePagination
          totalEntries={mockSalesData.length}
          entriesPerPage={ENTRIES_PER_PAGE}
        />
      </CardFooter>
      <TransactionDetailsSheet
        transaction={selectedTransaction}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </Card>
  );
};

export default UsersTable;

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
