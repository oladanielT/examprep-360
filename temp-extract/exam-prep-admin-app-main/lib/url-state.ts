"use client";

import {
  parseAsInteger,
  parseAsIsoDateTime,
  parseAsString,
  parseAsArrayOf,
  parseAsBoolean,
  useQueryStates,
  UseQueryStatesKeysMap,
} from "nuqs";

// ============================================
// CUSTOM PARSERS
// ============================================

/**
 * Parse number with optional range validation
 * Note: Range validation would need to be implemented in the consumer
 */
export const parseAsNumberInRange = (_min: number, _max: number) => {
  return parseAsInteger.withDefault(0).withOptions({
    shallow: false,
  });
};

/**
 * Parse optional number (can be null/undefined)
 */
export const parseAsOptionalNumber = parseAsInteger.withOptions({
  shallow: false,
});

/**
 * Parse optional date
 */
export const parseAsOptionalDate = parseAsIsoDateTime.withOptions({
  shallow: false,
});

/**
 * Parse optional string
 */
export const parseAsOptionalString = parseAsString.withOptions({
  shallow: false,
});

/**
 * Parse array of strings
 */
export const parseAsStringArray = parseAsArrayOf(parseAsString).withOptions({
  shallow: false,
});

/**
 * Parse array of numbers
 */
export const parseAsNumberArray = parseAsArrayOf(parseAsInteger).withOptions({
  shallow: false,
});

/**
 * Parse boolean with default false
 */
export const parseAsBool = parseAsBoolean.withDefault(false).withOptions({
  shallow: false,
});

// ============================================
// COMMON PARSERS
// ============================================

/**
 * Common search parser
 */
export const searchParser = {
  q: parseAsOptionalString,
} as const;

/**
 * Common pagination parser
 */
export const paginationParser = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
} as const;

/**
 * Sort parser
 */
export const sortParser = {
  sortBy: parseAsOptionalString,
  sortOrder: parseAsString.withDefault("desc"),
} as const;

// ============================================
// REUSABLE HOOKS
// ============================================

/**
 * Hook for search with URL state
 */
export function useSearch() {
  const [{ q }, setSearch] = useQueryStates(searchParser, {
    history: "push",
    shallow: false,
  });

  const setSearchQuery = (query: string | null) => {
    setSearch({ q: query });
  };

  const clearSearch = () => {
    setSearch({ q: null });
  };

  return {
    searchQuery: q,
    setSearchQuery,
    clearSearch,
  };
}

/**
 * Hook for pagination with URL state
 */
export function usePagination(defaultLimit: number = 10) {
  const [{ page, limit }, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(defaultLimit),
    },
    {
      history: "push",
      shallow: false,
    }
  );

  const setPage = (newPage: number) => {
    setPagination({ page: newPage });
  };

  const setLimit = (newLimit: number) => {
    setPagination({ limit: newLimit, page: 1 }); // Reset to page 1 when changing limit
  };

  const goToNextPage = () => {
    setPagination({ page: page + 1 });
  };

  const goToPreviousPage = () => {
    setPagination({ page: Math.max(1, page - 1) });
  };

  const resetPagination = () => {
    setPagination({ page: 1, limit: defaultLimit });
  };

  return {
    page,
    limit,
    setPage,
    setLimit,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
  };
}

/**
 * Hook for sorting with URL state
 */
export function useSort() {
  const [{ sortBy, sortOrder }, setSort] = useQueryStates(sortParser, {
    history: "push",
    shallow: false,
  });

  const setSorting = (field: string | null, order: "asc" | "desc" = "desc") => {
    setSort({ sortBy: field, sortOrder: order });
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle order if same field
      setSort({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
    } else {
      // New field, default to desc
      setSort({ sortBy: field, sortOrder: "desc" });
    }
  };

  const clearSort = () => {
    setSort({ sortBy: null, sortOrder: "desc" });
  };

  return {
    sortBy,
    sortOrder,
    setSort: setSorting,
    toggleSort,
    clearSort,
  };
}

/**
 * Define how date filters are stored in URL
 */
export const dateFiltersParser = {
  dateFrom: parseAsIsoDateTime, // ?dateFrom=2024-01-01
  dateTo: parseAsIsoDateTime, // ?dateTo=2024-12-31
} as const;

/**
 * Hook to use date filters
 */
export function useDateFilters() {
  const [filters, setFilters] = useQueryStates(dateFiltersParser, {
    history: "push",
    shallow: false,
  });

  // Helper: Clear all filters
  const clearFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
    });
  };

  // Helper: Update specific filters
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);
  };

  // Count how many filters are active
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== null && value !== undefined
  ).length;

  return {
    filters, // Current filter values
    setFilters, // Update filters
    updateFilters, // Update partial filters
    clearFilters, // Clear all
    activeFilterCount, // How many active
  };
}
// ============================================
// UTILITY FUNCTIONS
// ============================================

type FilterValue = string | number | boolean | Date | null | undefined;

/**
 * Convert URL state to API-friendly format
 * Removes null values and transforms as needed
 */
export function cleanFiltersForAPI<T extends Record<string, FilterValue>>(
  filters: T
): Partial<T> {
  return Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      // Convert dates to ISO strings for API
      if (value instanceof Date) {
        acc[key as keyof T] = value.toISOString() as T[keyof T];
      } else {
        acc[key as keyof T] = value as T[keyof T];
      }
    }
    return acc;
  }, {} as Partial<T>);
}

/**
 * Generate a shareable URL with current filters
 */
export function generateShareableURL(
  baseUrl: string,
  filters: Record<string, FilterValue>
): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof Date) {
        params.set(key, value.toISOString());
      } else {
        params.set(key, String(value));
      }
    }
  });

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

export type InferParserState<T extends UseQueryStatesKeysMap> = {
  // @ts-expect-error - parseServerSide return type is not easily inferable
  [K in keyof T]: ReturnType<T[K]["parseServerSide"]>;
};
