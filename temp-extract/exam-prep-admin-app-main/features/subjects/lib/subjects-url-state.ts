/**
 * NUQS Parser for Subject Filters
 *
 * This manages: examTypeId, dateFrom, dateTo, page, limit, search
 */

import {
  parseAsOptionalDate,
  parseAsOptionalNumber,
  parseAsOptionalString,
} from "@/lib/url-state";
import { useQueryStates, parseAsInteger } from "nuqs";

// ============================================
// SUBJECT FILTERS PARSER
// ============================================

export const subjectFiltersParser = {
  examTypeId: parseAsOptionalString, // ?examTypeId=uuid
  year: parseAsOptionalNumber, // ?examTypeId=uuid
  dateFrom: parseAsOptionalDate,
  dateTo: parseAsOptionalDate,
  page: parseAsInteger.withDefault(1), // ?page=1
  limit: parseAsInteger.withDefault(10), // ?limit=10
  search: parseAsOptionalString, // ?search=biology
} as const;

export function useSubjectFilters() {
  const [filters, setFilters] = useQueryStates(subjectFiltersParser, {
    history: "push",
    shallow: false,
  });

  const clearFilters = () => {
    setFilters({
      examTypeId: null,
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
    filters.examTypeId,
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
