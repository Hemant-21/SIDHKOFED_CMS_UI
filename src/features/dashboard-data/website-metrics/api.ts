'use client';

/**
 * Website Metrics data layer (Stage 5). Talks to the backend's
 * `/admin/dashboard/website-metrics/*` contracts (verified by reading `website-metrics.controller.ts`
 * / `.routes.ts` / `.service.ts` / `.validators.ts` directly in the Sidhkofed-Website repo — see
 * `types.ts`'s header for the full casing breakdown).
 *
 * Reuses the generic CRUD hooks (`@/hooks/crud`) wherever the resource fits the standard "P"
 * pattern the backend itself follows (`{resource}/{id}/{action}` — confirmed identical to
 * `adminResource()`'s URL builder): list/detail/create/update via `useCrudList`/`useCrudDetail`/
 * `useCrudCreate`/`useCrudUpdate`, and unpublish/archive/restore via `useLifecycleActions`. Only
 * `publish` needed a hand-rolled mutation — the generic `usePublish` posts with no body
 * (`api.publish(id)` in `crud-factory.ts` takes only an id), but this backend's publish REQUIRES a
 * `{ previewToken }` body (`website-metrics.controller.ts`'s `publish` handler rejects a missing
 * token with a 422 before it ever reaches the service). Preview/history/flag/unflag are likewise
 * hand-rolled sub-routes not covered by the generic resource shape.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api/http';
import { errorMessage } from '@/lib/api/server-errors';
import { useToast } from '@/hooks/use-toast';
import { invalidateDetail, invalidateResource } from '@/lib/query';
import { queryKeys } from '@/constants/query-keys';
import {
  useCrudCreate,
  useCrudDetail,
  useCrudList,
  useCrudUpdate,
  useLifecycleActions,
} from '@/hooks/crud';
import type { CrudMutationOptions } from '@/hooks/crud/crud-mutation-options';
import type { ListQuery } from '@/types/api';
import type {
  WebsiteMetricCreatePayload,
  WebsiteMetricDetail,
  WebsiteMetricListFilters,
  WebsiteMetricPreviewResult,
  WebsiteMetricSnapshot,
  WebsiteMetricSummary,
  WebsiteMetricUpdatePayload,
} from './types';

/** Matches `adminResource('dashboard/website-metrics')` → `/admin/dashboard/website-metrics`,
 * which is exactly the backend's mount path (`website-metrics.routes.ts`'s doc header). */
export const WEBSITE_METRICS_RESOURCE = 'dashboard/website-metrics';
const BASE = `/admin/${WEBSITE_METRICS_RESOURCE}`;
const detailPath = (id: string) => `${BASE}/${encodeURIComponent(id)}`;

// ── List / detail / create / update — generic CRUD hooks ─────────────────────────

export interface WebsiteMetricListQuery extends WebsiteMetricListFilters {
  page?: number;
  page_size?: number;
  /** Backend ordering fields: `display_order` (default) | `created_at` (`WEBSITE_METRIC_ORDERING_FIELDS`). */
  sort?: string;
  order?: 'asc' | 'desc';
}

export function useWebsiteMetricsList(filters: WebsiteMetricListQuery) {
  const query: ListQuery = {
    placement: filters.placement,
    enabled: filters.enabled,
    archived: filters.archived,
    page: filters.page,
    page_size: filters.page_size,
    sort: filters.sort,
    order: filters.order,
  };
  return useCrudList<WebsiteMetricSummary>(WEBSITE_METRICS_RESOURCE, query);
}

export function useWebsiteMetricDetail(id: string | undefined) {
  return useCrudDetail<WebsiteMetricDetail>(WEBSITE_METRICS_RESOURCE, id);
}

export function useCreateWebsiteMetric(
  options: CrudMutationOptions<WebsiteMetricDetail, WebsiteMetricCreatePayload> = {},
) {
  return useCrudCreate<WebsiteMetricCreatePayload, WebsiteMetricDetail>(WEBSITE_METRICS_RESOURCE, options);
}

/** `PATCH /:id` — config update. Bumps `configRevision` server-side whenever
 * reportKey/measureKey/filterConfig/periodConfig actually changed, which silently invalidates any
 * outstanding preview token (see `usePublishWebsiteMetric` below). */
export function useUpdateWebsiteMetricConfig(
  options: CrudMutationOptions<WebsiteMetricDetail, { id: string; body: WebsiteMetricUpdatePayload }> = {},
) {
  return useCrudUpdate<WebsiteMetricUpdatePayload, WebsiteMetricDetail>(WEBSITE_METRICS_RESOURCE, options);
}

// ── Lifecycle — unpublish/archive/restore fit the generic shape; publish does not ────────────────

/** unpublish/archive/restore — no request body, so the generic `useLifecycleActions` applies as-is. */
export function useWebsiteMetricLifecycleActions(
  options: CrudMutationOptions<WebsiteMetricDetail, string> = {},
) {
  const { unpublish, archive, restore } = useLifecycleActions<WebsiteMetricDetail>(
    WEBSITE_METRICS_RESOURCE,
    options,
  );
  return { unpublish, archive, restore };
}

/**
 * `POST /:id/publish` — the one lifecycle action the generic `usePublish` cannot express, since it
 * requires a `{ previewToken }` body (`website-metrics.controller.ts`). Rejects (409/422) when the
 * token is missing/expired/already consumed, belongs to a different metric, was issued against a
 * config revision that has since moved on (edited after preview), or previewed a null value — this
 * hook does not special-case those; `WebsiteMetricLifecycleActions` reads `error.fields`/message via
 * `errorMessage()` and surfaces the backend's own specific rejection text.
 */
export function usePublishWebsiteMetric(
  options: CrudMutationOptions<WebsiteMetricDetail, { id: string; previewToken: string }> = {},
) {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, previewToken }: { id: string; previewToken: string }) =>
      post<WebsiteMetricDetail, { previewToken: string }>(`${detailPath(id)}/publish`, { previewToken }),
    onSuccess: (data, vars) => {
      void invalidateResource(queryClient, WEBSITE_METRICS_RESOURCE);
      void invalidateDetail(queryClient, WEBSITE_METRICS_RESOURCE, vars.id);
      if (options.toastOnSuccess !== false) toast.success(options.successMessage ?? 'Published.');
      options.onSuccess?.(data, vars);
    },
    onError: (error, vars) => {
      if (options.toastOnError !== false) toast.error(errorMessage(error));
      options.onError?.(error, vars);
    },
  });
}

// ── Preview ────────────────────────────────────────────────────────────────────────

/**
 * `POST /:id/preview` — no body. A mutation (not a query): each click server-calculates a fresh
 * value, caches a short-lived (5 min, backend TTL) single-use `previewToken`, and returns it here.
 * The caller (the preview panel) holds the token + previewed config in local state and compares it
 * against the live form state to decide whether "re-preview before publishing" applies.
 */
export function usePreviewWebsiteMetric(
  options: CrudMutationOptions<WebsiteMetricPreviewResult, string> = {},
) {
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => post<WebsiteMetricPreviewResult>(`${detailPath(id)}/preview`),
    onSuccess: (data, id) => {
      if (options.toastOnSuccess) toast.success(options.successMessage ?? 'Preview calculated.');
      options.onSuccess?.(data, id);
    },
    onError: (error, id) => {
      if (options.toastOnError !== false) toast.error(errorMessage(error));
      options.onError?.(error, id);
    },
  });
}

// ── History + manual review flag ────────────────────────────────────────────────────

export function useWebsiteMetricHistory(id: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.resource(WEBSITE_METRICS_RESOURCE).detail(id ?? ''), 'history'] as const,
    queryFn: () => get<WebsiteMetricSnapshot[]>(`${detailPath(id as string)}/history`),
    enabled: Boolean(id),
  });
}

function useReviewFlagMutation(action: 'flag-review' | 'unflag-review', defaultMessage: string) {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => post<WebsiteMetricDetail>(`${detailPath(id)}/${action}`),
    onSuccess: (_data, id) => {
      void invalidateDetail(queryClient, WEBSITE_METRICS_RESOURCE, id);
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.resource(WEBSITE_METRICS_RESOURCE).detail(id), 'history'],
      });
      toast.success(defaultMessage);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useFlagReview() {
  return useReviewFlagMutation('flag-review', 'Flagged for review.');
}

export function useUnflagReview() {
  return useReviewFlagMutation('unflag-review', 'Review flag cleared.');
}
