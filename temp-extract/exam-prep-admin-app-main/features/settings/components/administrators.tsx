import { columns } from "../columns";
import { DataTable } from "@/components/tables/data-table";
import PrimaryButton from "@/components/buttons/primary-button";
import { TablePagination } from "@/components/tables/table-pagination";
import { AddNewAdminDialog } from "./add-new-admin-dialog";

const Administrators = () => {
  return (
    <div className="w-full relative">
      <AddNewAdminDialog>
        <PrimaryButton
          className="absolute -top-36 right-5"
          title="Add new administration"
        />
      </AddNewAdminDialog>

      <DataTable
        rowClassName=" border-0"
        columns={columns}
        data={new Array(5).fill({
          id: "257",
          name: "Hellena John",
          email: "Hellenajohn@email.com",
          date: "Jan 17, 2023",
          permission: "Admin",
        })}
      />
      <TablePagination totalEntries={5} entriesPerPage={5} />
    </div>
  );
};

export default Administrators;
