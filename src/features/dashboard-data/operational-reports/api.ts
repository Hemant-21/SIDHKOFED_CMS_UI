'use client';

/**
 * Operational Reports data layer (Stage 4). Consumes the backend's
 * `/admin/dashboard/operational-reports/*` contracts, verified against a running local backend
 * (see below) rather than assumed from the plan doc.
 *
 * Verification method: started the backend locally (`npm run dev` in Sidhkofed-Website against
 * the already-migrated local Postgres `sidhkofed_cms`), logged in as the seeded super admin, and
 * hit the catalogue/generate/export endpoints directly with curl:
 *   - `GET  /admin/dashboard/operational-reports` → `{ success, data: OperationalReportDefinition[] }`
 *   - `POST /admin/dashboard/operational-reports/:key/generate` → `{ success, data: OperationalReportResult }`
 *   - `POST /admin/dashboard/operational-reports/:key/export` → XLSX octet stream
 *   - `POST /admin/dashboard/website-metrics` → `{ success, data: WebsiteMetricRecord }` (snake_case!)
 * The operational-reports wire shape is camelCase throughout (periodInput/reportKey/labelEn/…);
 * website-metrics REQUEST bodies are also camelCase (its own `.validators.ts`), but its RESPONSE
 * DTO is snake_case (its `toDto()` mapper) — the two conventions coexist in the same backend, so
 * `types.ts` models each direction exactly as observed, not assumed.
 *
 * `generate` is read-only and re-run on every filter/period change, so — mirroring
 * `useReportPreview` in `../api.ts` — it is a `useQuery` keyed on its full request body, even
 * though the HTTP verb is POST (the backend's own doc comments call it "live-calculate", i.e. a
 * read). `export` triggers a file download as a side effect, so it is a `useMutation` whose
 * `onSuccess` saves the blob via the shared `downloadBlob` helper (the same primitive
 * `features/enquiries/api.ts` uses for its XLSX export).
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { get, post, postBlob } from '@/lib/api/http';
import { errorMessage } from '@/lib/api/server-errors';
import { useToast } from '@/hooks/use-toast';
import { downloadBlob } from '@/utils/browser';
import type {
  ExportReportBody,
  GenerateReportBody,
  OperationalReportDefinition,
  OperationalReportResult,
  WebsiteMetricCreateInput,
  WebsiteMetricRecord,
} from './types';

const OPERATIONAL_REPORTS_BASE = '/admin/dashboard/operational-reports';
const WEBSITE_METRICS_BASE = '/admin/dashboard/website-metrics';

const generatePath = (reportKey: string) =>
  `${OPERATIONAL_REPORTS_BASE}/${encodeURIComponent(reportKey)}/generate`;
const exportPath = (reportKey: string) =>
  `${OPERATIONAL_REPORTS_BASE}/${encodeURIComponent(reportKey)}/export`;

const catalogueKey = () => ['operational-reports', 'catalogue'] as const;
const generateKey = (reportKey: string, body: GenerateReportBody) =>
  ['operational-reports', 'generate', reportKey, body] as const;

/** The fixed report+measure catalogue (`GET /admin/dashboard/operational-reports`). */
export function useOperationalReportsCatalogue() {
  return useQuery({
    queryKey: catalogueKey(),
    queryFn: () => get<OperationalReportDefinition[]>(OPERATIONAL_REPORTS_BASE),
    staleTime: 5 * 60_000,
  });
}

/**
 * Live-calculate a report for the current period/filters/page
 * (`POST /admin/dashboard/operational-reports/:key/generate`). Disabled until a report key and a
 * complete period input are supplied — the caller (the filter form's "Apply") controls when the
 * body actually changes, so this only re-fetches when Apply is clicked (or page changes), never
 * on every keystroke.
 */
export function useGenerateOperationalReport(
  reportKey: string | undefined,
  body: GenerateReportBody | undefined,
  opts: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: generateKey(reportKey ?? '', body ?? { periodInput: { mode: 'current_financial_year' } }),
    queryFn: () => post<OperationalReportResult, GenerateReportBody>(generatePath(reportKey as string), body),
    enabled: Boolean(reportKey) && Boolean(body) && (opts.enabled ?? true),
    staleTime: 30_000,
  });
}

/**
 * XLSX export (`POST /admin/dashboard/operational-reports/:key/export`). A mutation because it is
 * a one-shot action with a side effect (file download), not cacheable state. Row limit 50,000 —
 * a 413 from the backend surfaces as a normal toast error (its body is a blob, not the JSON error
 * envelope, so the toast falls back to a generic "Something went wrong" message rather than the
 * backend's specific row-count message; acceptable for now, flagged for a future refinement).
 */
export function useExportOperationalReport(reportKey: string) {
  const toast = useToast();
  return useMutation({
    mutationFn: (body: ExportReportBody) => postBlob(exportPath(reportKey), body),
    onSuccess: (blob) => {
      const today = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `${reportKey}-${today}.xlsx`);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

/**
 * "Use on website" — creates a DRAFT Website Metric config from the current
 * report/measure/filters/period (`POST /admin/dashboard/website-metrics`). Never publishes;
 * Stage 5's editor takes it from here. Toasts on failure only — success navigation is the
 * caller's job (it needs the new id to route to the not-yet-built edit page).
 */
export function useCreateWebsiteMetricDraft() {
  const toast = useToast();
  return useMutation({
    mutationFn: (body: WebsiteMetricCreateInput) =>
      post<WebsiteMetricRecord, WebsiteMetricCreateInput>(WEBSITE_METRICS_BASE, body),
    onError: (error) => toast.error(errorMessage(error)),
  });
}
