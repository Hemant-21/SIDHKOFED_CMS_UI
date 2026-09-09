/**
 * Reusable CRUD hook layer (Phase 15.1). These compose the API client factory,
 * the query-key namespace, cache helpers, and toast/dialog providers into the
 * standard data-access hooks every future module page reuses — so a module's data
 * layer is a few lines, not a rewrite.
 */

export { useCrudList } from './use-crud-list';
export { useCrudDetail } from './use-crud-detail';
export { useCrudCreate } from './use-crud-create';
export { useCrudUpdate } from './use-crud-update';
export { usePublish, useArchive, useRestore, useLifecycleActions } from './use-lifecycle';
export { useBulkAction } from './use-bulk-action';
export { useFilters } from './use-filters';
