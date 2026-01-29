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
    <div className="border-b p-6 md:py-10">
      {backLink && (
        <Link
          className="mb-4 flex items-center gap-2 text-lg font-medium text-muted-foreground hover:text-foreground md:mb-5"
          to={backLink}
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </Link>
      )}

      {/* Main Header Content: Stacks vertically on mobile, Row on desktop */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        
        {/* Headings Area */}
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
          <p className="text-sm text-muted-foreground md:text-base opacity-60">
            {subHeading}
          </p>
        </div>

        {/* Actions Area: Search & Filter */}
        {search && (
          <div
            className={cn(
              // Mobile: Full width, stacked or flex-row depending on preference (here column for safe spacing)
              // Tablet/Desktop: Auto width, row layout, right aligned
              "flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto md:justify-end"
            )}
          >
            {filter && (
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-full bg-white hover:bg-black/5 hover:text-black sm:w-auto"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            )}
            
            {/* Wrapper for SearchField to ensure it stretches on mobile if needed */}
            <div className="w-full sm:w-auto">
                <SearchField />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}