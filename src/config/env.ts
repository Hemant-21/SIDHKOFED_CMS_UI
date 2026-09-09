/**
 * Centralized, typed access to public runtime configuration. No other file reads
 * `process.env` directly (mirrors the backend foundation rule, doc 05). Only
 * NEXT_PUBLIC_* values exist in the browser; the frontend holds no secrets.
 */

function readPublic(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  /** API base path as seen by the browser. Immutable backend contract: /api/v1. */
  apiBaseUrl: readPublic('NEXT_PUBLIC_API_BASE_URL', '/api/v1'),
  /** Optional deployment base path, for hosting the CMS below a single-domain prefix. */
  basePath: readPublic('NEXT_PUBLIC_BASE_PATH', ''),
  /** Default UI language. English primary, Hindi optional (codex §10). */
  defaultLanguage: readPublic('NEXT_PUBLIC_DEFAULT_LANGUAGE', 'en') as 'en' | 'hi',
  /**
   * Public website origin (no trailing slash). The admin console and the public site are
   * separate apps on separate origins, but the backend returns `public_url` as a site-relative
   * path (e.g. `/events/slug`) — resolve it against this origin, not the admin's own.
   */
  websiteUrl: readPublic('NEXT_PUBLIC_WEBSITE_URL', 'http://localhost:3002'),
} as const;
