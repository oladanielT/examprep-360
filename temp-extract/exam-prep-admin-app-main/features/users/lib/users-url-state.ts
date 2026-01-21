/**
 * NUQS Parser for User Filters
 *
 * This manages: filter, examType, dateFrom, dateTo, page, limit, search
 */

import { parseAsOptionalDate, parseAsOptionalString } from "@/lib/url-state";
import { useQueryStates, parseAsInteger, parseAsStringLiteral } from "nuqs";

// ============================================
// USER FILTERS PARSER
// ============================================

export const userFiltersParser = {
  filter: parseAsStringLiteral(["all", "subscribed", "banned", "inactive"] as const).withDefault("all"),
  examType: parseAsOptionalString, // ?examType=WAEC
  dateFrom: parseAsOptionalDate,
  dateTo: parseAsOptionalDate,
  page: parseAsInteger.withDefault(1), // ?page=1
  limit: parseAsInteger.withDefault(10), // ?limit=10
  search: parseAsOptionalString, // ?search=john
} as const;

export function useUserFilters() {
  const [filters, setFilters] = useQueryStates(userFiltersParser, {
    history: "push",
    shallow: false,
  });

  const clearFilters = () => {
    setFilters({
      filter: "all",
      examType: null,
      dateFrom: null,
      dateTo: null,
      page: 1,
      limit: 10,
      search: null,
    });
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);
  };

  const activeFilterCount = [
    filters.examType,
    filters.dateFrom,
    filters.dateTo,
    filters.search,
  ].filter((value) => value !== null && value !== undefined).length;

  return {
    filters,
    setFilters,
    updateFilters,
    clearFilters,
    activeFilterCount,
  };
}
