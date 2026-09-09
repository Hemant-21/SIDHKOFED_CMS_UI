'use client';

/**
 * Official Communications data layer. Standard list/detail/create/update/lifecycle use the
 * shared CRUD hooks against the `official-communications` resource. No module-specific
 * actions beyond the generic "P" pattern.
 */

export const COMMUNICATIONS_RESOURCE = 'official-communications';

export { COMMUNICATION_PERMS } from './permissions';
