'use client';

/**
 * Programmes data layer. Standard list/detail/create/update/lifecycle come from the shared CRUD
 * hooks against the `programmes` resource — no bespoke fetch logic. Programmes have no
 * module-specific actions beyond the generic "P" pattern, so this module only re-exports the
 * resource key and the module-specific permission set.
 */

export const PROGRAMMES_RESOURCE = 'programmes';

export { PROGRAMME_PERMS } from './permissions';
