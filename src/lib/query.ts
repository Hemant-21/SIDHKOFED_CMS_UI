/**
 * Cache helpers built on the shared QueryClient: invalidation, optimistic-update
 * scaffolding, and prefetch. Future modules call these instead of hand-rolling
 * cache keys/mutation plumbing.
 */

import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';

/** Invalidate every list+detail query for a resource (after a mutation). */
export function invalidateResource(client: QueryClient, resource: string): Promise<void> {
  return client.invalidateQueries({ queryKey: queryKeys.resource(resource).all });
}

/** Invalidate a single detail entry. */
export function invalidateDetail(
  client: QueryClient,
  resource: string,
  id: string,
): Promise<void> {
  return client.invalidateQueries({ queryKey: queryKeys.resource(resource).detail(id) });
}
