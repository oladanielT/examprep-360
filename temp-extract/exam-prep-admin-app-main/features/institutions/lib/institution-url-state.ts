/**
 * NUQS Parser for Course Filters
 *
 * This manages: courses, dateFrom, dateTo
 */

import { parseAsOptionalDate, parseAsOptionalNumber } from "@/lib/url-state";
import { useQueryStates, parseAsInteger, parseAsIsoDateTime } from "nuqs";

// ============================================
// COURSE FILTERS PARSER
// ============================================

export const courseFiltersParser = {
  courses: parseAsOptionalNumber, // ?courses=50
  dateFrom: parseAsOptionalDate, // ?dateFrom=2024-01-01
  dateTo: parseAsOptionalDate, // ?dateTo=2024-12-31
} as const;

export function useInstitutionFilters() {
  const [filters, setFilters] = useQueryStates(courseFiltersParser, {
    history: "push",
    shallow: false,
  });

  const clearFilters = () => {
    setFilters({
      courses: null,
      dateFrom: null,
      dateTo: null,
    });
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);
  };

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== null && value !== undefined
  ).length;

  return {
    filters,
    setFilters,
    updateFilters,
    clearFilters,
    activeFilterCount,
  };
}
