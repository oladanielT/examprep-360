import { useState, useRef, useEffect } from "react";
import SearchField from "./search-field";
import { Button } from "../ui/button";
import { ArrowLeft, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export interface FilterOption {
  label: string;
  value: string;
}

interface PageHeaderProps {
  backLink?: string;
  filter?: boolean;
  search?: boolean;
  heading: string;
  subHeading: string;
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
}

export default function CustomPageHeader({
  backLink,
  heading,
  subHeading,
  filter = false,
  search = true,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filterOptions = [],
  activeFilter,
  onFilterChange,
}: PageHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasActiveFilter = activeFilter && activeFilter !== "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

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

      {/* Main Header Content */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Headings Area */}
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
          <p className="text-sm text-muted-foreground md:text-base opacity-60">
            {subHeading}
          </p>
        </div>

        {/* Actions Area: Search & Filter */}
        {(search || (filter && filterOptions.length > 0)) && (
          <div
            className={cn(
              "flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto md:justify-end"
            )}
          >
            {filter && filterOptions.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    "h-12 w-full bg-white hover:bg-black/5 hover:text-black sm:w-auto",
                    hasActiveFilter && "border-[#F04F54] text-[#F04F54]"
                  )}
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {hasActiveFilter
                    ? filterOptions.find((o) => o.value === activeFilter)
                        ?.label || "Filter"
                    : "Filter"}
                  {hasActiveFilter && (
                    <span
                      className="ml-2 inline-flex"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFilterChange?.("");
                        setDropdownOpen(false);
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </span>
                  )}
                </Button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-lg border bg-white shadow-lg">
                    <div className="py-1">
                      <button
                        className={cn(
                          "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors",
                          !hasActiveFilter && "text-[#F04F54] font-medium"
                        )}
                        onClick={() => {
                          onFilterChange?.("");
                          setDropdownOpen(false);
                        }}
                      >
                        All
                      </button>
                      {filterOptions.map((option) => (
                        <button
                          key={option.value}
                          className={cn(
                            "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors",
                            activeFilter === option.value &&
                              "text-[#F04F54] font-medium"
                          )}
                          onClick={() => {
                            onFilterChange?.(option.value);
                            setDropdownOpen(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {search && (
              <div className="w-full sm:w-auto">
                <SearchField
                  value={searchValue}
                  onChange={onSearchChange}
                  placeholder={searchPlaceholder}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
