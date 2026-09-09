'use client';

/**
 * Institutions data layer. Standard list/detail/create/update/lifecycle come from the shared CRUD
 * hooks against the `institutions` resource — no bespoke fetch logic. Institutions have no
 * module-specific actions beyond the generic "P" pattern, so this module only re-exports the
 * resource key and the shared content permission set.
 *
 * Institutions are authorized with the project's generic `content.*` RBAC (institutions.routes.ts),
 * exactly like documents/events — so the permission keys are reused from the events feature rather
 * than redefined.
 */

export const INSTITUTIONS_RESOURCE = 'institutions';

/** Institutions reuse the shared content RBAC keys (institutions.routes.ts maps to `content.*`). */
export { CONTENT_PERMS } from '@/features/events/permissions';
