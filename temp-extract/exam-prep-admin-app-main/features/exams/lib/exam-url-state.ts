"use client";

import { createSerializer, useQueryStates } from "nuqs";
import {
  parseAsOptionalNumber,
  parseAsOptionalDate,
  parseAsOptionalString,
  searchParser,
  paginationParser,
  sortParser,
  InferParserState,
} from "@/lib/url-state"; // Adjust this import path as needed

export const examFiltersParser = {
  subjects: parseAsOptionalNumber,
  subscribers: parseAsOptionalNumber,
  dateFrom: parseAsOptionalDate,
  dateTo: parseAsOptionalDate,
} as const;

/**
 * Type inference from parser
 */
export type ExamFiltersState = InferParserState<typeof examFiltersParser>;

// ============================================
// COMBINED PARSERS FOR EXAMS
// ============================================

/**
 * Complete exam list parser (filters + search + pagination + sort)
 */
export const examListParser = {
  ...examFiltersParser,
  ...searchParser,
  ...paginationParser,
  ...sortParser,
} as const;

/**
 * Type for exam list state
 */
export type ExamListState = InferParserState<typeof examListParser>;

// ============================================
// SERIALIZERS (For generating URLs)
// ============================================

/**
 * Create a URL with exam filters
 * Useful for generating links programmatically
 */
export const serializeExamFilters = createSerializer(examFiltersParser);

/**
 * Create a URL with full exam list state
 */
export const serializeExamList = createSerializer(examListParser);

// ============================================
// REUSABLE HOOKS
// ============================================

/**
 * Hook for exam filters with URL state
 */
export function useExamFilters() {
  const [filters, setFilters] = useQueryStates(examFiltersParser, {
    history: "push",
    shallow: false,
  });

  // Helper to clear all filters
  const clearFilters = () => {
    setFilters({
      subjects: null,
      subscribers: null,
      dateFrom: null,
      dateTo: null,
    });
  };

  // Helper to update partial filters
  const updateFilters = (partial: Partial<ExamFiltersState>) => {
    setFilters(partial);
  };

  // Helper to check if any filter is active
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== null && value !== undefined
  );

  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "subjects" || key === "subscribers") {
      return value !== null && typeof value === "number" && value > 0;
    }
    return value !== null;
  }).length;

  return {
    filters,
    setFilters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}

/**
 * Hook for complete exam list state (filters + search + pagination)
 */
export function useExamListState() {
  const [state, setState] = useQueryStates(examListParser, {
    history: "push",
    shallow: false,
  });

  // Helper to clear only filters (preserve search, pagination, sort)
  const clearFilters = () => {
    setState({
      subjects: null,
      subscribers: null,
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
  const updateState = (partial: Partial<ExamListState>) => {
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
