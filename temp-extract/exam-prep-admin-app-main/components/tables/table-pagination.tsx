"use client";

import * as React from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TablePaginationProps {
  totalEntries: number;
  entriesPerPage: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
}

export function TablePagination({
  totalEntries,
  entriesPerPage,
  currentPage: controlledPage,
  onPageChange,
  onLimitChange,
  onNextPage,
  onPreviousPage,
}: TablePaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Use controlled page if provided, otherwise read from URL (backwards compatibility)
  const currentPage = controlledPage ?? parseInt(searchParams.get("page") || "1", 10);

  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  const startIndex = Math.max(0, (currentPage - 1) * entriesPerPage);
  const endIndex = Math.min(totalEntries, startIndex + entriesPerPage);

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  // Backwards compatibility: manual URL manipulation
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());

    if (!params.has("limit")) {
      params.set("limit", entriesPerPage.toString());
    }
    return `${pathname}?${params.toString()}`;
  };

  const handleNavigation = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      router.push(createPageURL(newPage));
    }
  };

  const handleNextClick = () => {
    if (onNextPage) {
      onNextPage();
    } else {
      handleNavigation(currentPage + 1);
    }
  };

  const handlePrevClick = () => {
    if (onPreviousPage) {
      onPreviousPage();
    } else {
      handleNavigation(currentPage - 1);
    }
  };

  const handleLimitChange = (newLimit: string) => {
    if (onLimitChange) {
      onLimitChange(parseInt(newLimit, 10));
    } else {
      const params = new URLSearchParams(searchParams);
      params.set("limit", newLimit);
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  if (totalEntries === 0) {
    return (
      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-muted-foreground">No entries found.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-between py-4 border-t border-border mt-4">
      <div className="flex items-center gap-2">
        <span className="text-xs">Show</span>
        <Select value={entriesPerPage.toString()} onValueChange={handleLimitChange}>
          <SelectTrigger className="">
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="30">30</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs">Entries</span>
      </div>
      {/* 💡 Entry Count Display */}
      <div className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-semibold text-foreground">
          {startIndex + 1} - {endIndex}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-foreground">
          {totalEntries.toLocaleString()}
        </span>{" "}
        entries
      </div>

      {/* Next/Previous Buttons */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevClick}
          disabled={isPrevDisabled}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextClick}
          disabled={isNextDisabled}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
