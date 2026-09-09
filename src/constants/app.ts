/**
 * Application-wide constants: pagination, date formats, validation regex, and app
 * config. Single home for values multiple modules would otherwise duplicate.
 */

/** Pagination: backend default 20, cap 100 (API spec §1.4). */
export const PAGE_SIZE_DEFAULT = 20;
export const PAGE_SIZE_MAX = 100;

/** Validation regex (frontend pre-checks; backend remains authoritative). */
export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  /** Indian mobile: optional +91/0 prefix then 10 digits starting 6–9. */
  mobile: /^(?:\+91|0)?[6-9]\d{9}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  url: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
} as const;

/** Debounce defaults (search inputs, etc.), in milliseconds. */
export const DEBOUNCE_MS = 300;

export const APP = {
  name: 'SIDHKOFED CMS',
  shortName: 'SIDHKOFED',
  /** Toast auto-dismiss default (ms). */
  toastDuration: 5000,
} as const;

/** localStorage keys (namespaced to avoid collisions). */
export const STORAGE_KEYS = {
  theme: 'sidhkofed.theme',
  sidebarCollapsed: 'sidhkofed.sidebar.collapsed',
  language: 'sidhkofed.language',
  draftPrefix: 'sidhkofed.draft.',
} as const;
