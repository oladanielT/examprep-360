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
import { Filter, FilterIcon, SearchIcon } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { TablePagination } from "@/components/tables/table-pagination";
import { columns, Ticket } from "../columns";
import { TableTabs } from "@/components/tables/table-tabs";

import { useState } from "react";
import { TicketDialog } from "./tickets-dialog";
import { SearchInput } from "@/components/globals/search-input";
import { FilterDialog } from "@/features/users/components/users-table-filter";
import { useDateFilters } from "@/lib/url-state";
import { Badge } from "@/components/ui/badge";

const TicketsTable = () => {
  const ENTRIES_PER_PAGE = 10;
  const { activeFilterCount } = useDateFilters();
  const [rowData, setRowData] = useState<Ticket>();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Card className="mt-10 p-2">
      <CardHeader className="border-b-0 gap-32 justify-start">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Tickets
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
      </CardHeader>
      <CardContent className="border-0 ">
        <TableTabs tabs={ticketsTabs} baseUrl="/tickets" />
        <div className="pt-10">
          <DataTable
            onRowClick={(row) => {
              setRowData(row.original);
              setOpen(true);
            }}
            columns={columns}
            data={new Array(10).fill({
              id: "ID: 12345",
              name: "Kunle Bisi",
              email: "support@untitledsoftware.com",
              complaint: "Received the wrong...",
              phoneNumber: "+234 701 234 5678",
              date: "Jan 15, 2025",
            })}
          />
          {open && <TicketDialog ticketData={rowData} />}
        </div>
      </CardContent>
      <CardFooter className="border-t-0">
        <TablePagination totalEntries={20} entriesPerPage={ENTRIES_PER_PAGE} />
      </CardFooter>
    </Card>
  );
};

export default TicketsTable;

const ticketsTabs = [
  // Each href is the query string to apply
  { title: "All tickets", href: "?filter=all" },
  { title: "Pending tickets", href: "?filter=pending" },
  { title: "Resolved Tickets", href: "?filter=resolved" },
];
