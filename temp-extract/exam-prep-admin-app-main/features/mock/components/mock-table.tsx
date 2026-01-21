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
import { Filter, SearchIcon } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { TablePagination } from "@/components/tables/table-pagination";
import { FilterDialog } from "@/components/dialogs/filter-dialog";
import { columns } from "../columns";
import PrimaryButton from "@/components/buttons/primary-button";
import { SearchInput } from "@/components/globals/search-input";

const MockTable = () => {
  const ENTRIES_PER_PAGE = 10;
  return (
    <Card className="mt-10 p-2">
      <CardHeader className="border-b-0 gap-32 justify-start">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Big Mock
        </CardTitle>
        <div className="flex items-center gap-5">
          <SearchInput placeholder="Search..." />
          {/* <FilterDialog>
            <Button variant="outline" size="lg">
              <Filter />
              Filter
            </Button>
          </FilterDialog> */}
        </div>
        <PrimaryButton title="Create Big Mock" className="ml-auto  my-auto" />
      </CardHeader>
      <CardContent className="border-0 ">
        <DataTable
          columns={columns}
          data={new Array(10).fill({
            id: "257",
            mockName: "WAEC January",
            examType: "WAEC",
            subject: "12",
            date: "Jan 15, 2025",
          })}
        />
      </CardContent>
      <CardFooter className="border-t-0">
        <TablePagination totalEntries={20} entriesPerPage={ENTRIES_PER_PAGE} />
      </CardFooter>
    </Card>
  );
};

export default MockTable;
