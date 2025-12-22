import SearchField from "./search-field";

import { Button } from "../ui/button";
import { ArrowLeft, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface PageHeaderProps {
  backLink?: string;
  filter?: boolean;
  search?: boolean;
  heading: string;
  subHeading: string;
}

export default function CustomPageHeader({
  backLink,
  heading,
  subHeading,
  filter = false,
  search = true,
}: PageHeaderProps) {
  return (
    <div className=" border-b py-10 ">
      {backLink && (
        <Link
          className=" mb-5 flex items-center gap-2 text-lg font-medium"
          to={backLink}
        >
          {" "}
          <ArrowLeft /> Back
        </Link>
      )}
      <div className=" flex justify-between">
        <div className="w-full">
          <h1 className=" font-semibold text-2xl">{heading}</h1>
          <p className=" opacity-60">{subHeading}</p>
        </div>
        {search && (
          <div className={cn("w-full flex gap-5 items-center  justify-end")}>
            {filter && (
              <Button
                variant="outline"
                size="lg"
                className=" bg-white hover:bg-black/5  hover:text-black h-12"
              >
                <Filter />
                Filter
              </Button>
            )}
            <SearchField />
          </div>
        )}
      </div>
    </div>
  );
}
