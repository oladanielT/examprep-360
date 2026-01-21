"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation"; // 💡 Import useSearchParams
import { cn } from "@/lib/utils";

// The structure is kept clean, expecting the full query string in href
interface TabItem {
  title: string;
  href: string; // e.g., "?filter=all"
}

interface TableTabsProps {
  tabs: TabItem[];
  // We still need the base URL to construct the full link for navigation
  baseUrl: string; // e.g., "/users"
}

export function TableTabs({ tabs, baseUrl }: TableTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 💡 Extract the specific 'filter' parameter value
  const currentFilter = searchParams.get("filter");

  // Helper to extract the filter value from the tab's href (e.g., from "?filter=all" -> "all")
  const getFilterValueFromHref = (href: string) => {
    // 1. Create a URLSearchParams object from the href string (which should start with '?')
    const params = new URLSearchParams(
      href.startsWith("?") ? href.substring(1) : href
    );
    // 2. Return the value of the 'filter' key
    return params.get("filter");
  };

  return (
    <div className="flex space-x-6 border-b-3 border-[##E4E4E7]">
      {tabs.map((tab) => {
        const tabFilterValue = getFilterValueFromHref(tab.href);
        const isActive = tabFilterValue === currentFilter;
        const fullHref = `${baseUrl}${tab.href}`;

        return (
          <Link
            key={tab.title}
            href={fullHref}
            className={cn(
              "relative pb-4 capitalize text-sm font-medium transition-colors duration-200",
              isActive
                ? "text-[#F04F54]"
                : "text-[#52525B] hover:text-[#F04F54]/70"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.title}

            {/* Red Underline (Active Indicator) */}
            {isActive && (
              <div className="absolute inset-x-0 -bottom-0.5 h-[2.5px] bg-[#F04F54] rounded-sm" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
