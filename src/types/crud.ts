/**
 * Generic CRUD-framework types. These describe the *reusable* surfaces every
 * future module composes — resource config, relationship selectors, declarative
 * filters, and bulk actions. No module-specific fields live here (codex: reuse
 * over duplication). They sit on top of the api/common primitives.
 */

import type { ListQuery } from './api';

/** Normalized, URL-friendly filter state (string values only). */
export type FilterState = Record<string, string | undefined>;

/** Aggregated outcome of running a bulk action over a selection. */
export interface BulkResult {
  total: number;
  succeeded: string[];
  failed: Array<{ id: string; error: unknown }>;
}

/** A query plus the controls that produced it (returned by the filter framework). */
export interface FilterController {
  /** The composed, backend-ready list query. */
  query: ListQuery;
  filters: FilterState;
  search: string;
  ordering: string | undefined;
  page: number;
  setFilter: (key: string, value: string | undefined) => void;
  setSearch: (value: string) => void;
  setOrdering: (value: string | undefined) => void;
  setPage: (page: number) => void;
  reset: () => void;
  /** True when any filter/search/ordering is active. */
  isActive: boolean;
}
