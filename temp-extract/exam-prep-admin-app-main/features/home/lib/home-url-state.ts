import {
  InferParserState,
  paginationParser,
  parseAsOptionalDate,
  parseAsOptionalString,
  searchParser,
  sortParser,
} from "@/lib/url-state";
import { createSerializer, useQueryStates } from "nuqs";

export const homeFiltersParser = {
  schoolType: parseAsOptionalString,
  examType: parseAsOptionalString,
  course: parseAsOptionalString,
  status: parseAsOptionalString,
  dateFrom: parseAsOptionalDate,
  dateTo: parseAsOptionalDate,
} as const;

export type HomeFiltersState = InferParserState<typeof homeFiltersParser>;

export const homeListParser = {
  ...homeFiltersParser,
  ...searchParser,
  ...paginationParser,
  ...sortParser,
} as const;

/**
 * Type for exam list state
 */
export type HomeListState = InferParserState<typeof homeListParser>;

export const serializeHomeFilters = createSerializer(homeFiltersParser);

/**
 * Create a URL with full exam list state
 */
export const serializeHomeList = createSerializer(homeListParser);

/**
 * Hook to use general filters
 */
export function useHomeFilters() {
  const [filters, setFilters] = useQueryStates(homeFiltersParser, {
    history: "push",
    shallow: false,
  });

  // Helper: Clear all filters
  const clearFilters = () => {
    setFilters({
      schoolType: null,
      examType: null,
      course: null,
      status: null,
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

/**
 * Hook for complete exam list state (filters + search + pagination)
 */
export function useHomeListState() {
  const [state, setState] = useQueryStates(homeListParser, {
    history: "push",
    shallow: false,
  });

  // Helper to clear only filters (preserve search, pagination, sort)
  const clearFilters = () => {
    setState({
      schoolType: null,
      examType: null,
      course: null,
      status: null,
      dateFrom: null,
      dateTo: null,
    });
  };

  // Helper to clear search
  const clearSearch = () => {
    setState({ q: null });
  };

  // Helper to reset pagination
  const resetPagination = () => {
    setState({ page: 1 });
  };

  // Helper to update state partially
  const updateState = (partial: Partial<HomeListState>) => {
    setState(partial);
  };

  return {
    state,
    setState,
    updateState,
    clearFilters,
    clearSearch,
    resetPagination,
  };
}
