import { columns } from "../columns";
import { DataTable } from "@/components/tables/data-table";
import { TablePagination } from "@/components/tables/table-pagination";
import { activityColumns } from "../activity-columns";

const Activity = () => {
  return (
    <div className="">
      <DataTable
        rowClassName="border-0"
        columns={activityColumns}
        data={new Array(5).fill({
          id: "257",
          ipAddress: "192.168.1.1",
          action: "User logged in successfully.",
          date: "Jan 17, 2023",
        })}
      />
      <TablePagination totalEntries={5} entriesPerPage={5} />
    </div>
  );
};

export default Activity;
