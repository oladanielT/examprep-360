"use client";

import React from "react";
import { Button } from "../ui/button";
import { CloudDownload } from "lucide-react";
import { useAdmin } from "@/lib/auth";

interface Props {
  name?: string;
  desc: string;
  icon?: boolean;
  onClick?: () => void;
}

const PageHeader = ({ name, desc, icon = false, onClick }: Props) => {
  const { data: admin, isLoading } = useAdmin();
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-gray-800 text-3xl font-semibold">
          Welcome Back, {isLoading ? "Loading..." : admin?.fullName || name}
        </h2>
        <p className="text-gray-500">{desc}</p>
      </div>
      {icon && (
        <Button
          onClick={onClick}
          variant="outline"
          className="text-sm text-gray-700 font-semibold"
          size="lg"
        >
          <CloudDownload className="size-6" /> Export
        </Button>
      )}
    </div>
  );
};

export default PageHeader;
