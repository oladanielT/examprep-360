import { cn } from "@/lib/utils";
import React from "react";
import { AdminGuard } from "../guards";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const AppSidbarContent = ({ children, className }: Props) => {
  return (
    <AdminGuard>
      <div
        className={cn(
          "bg-white min-h-screen px-14 py-10 rounded-tl-[6rem]",
          className
        )}
      >
        <div className="max-w-6xl mx-auto w-full">{children}</div>
      </div>
    </AdminGuard>
  );
};

export default AppSidbarContent;
