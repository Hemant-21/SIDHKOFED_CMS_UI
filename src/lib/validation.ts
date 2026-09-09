/**
 * Reusable Zod schema primitives shared across future module forms (bilingual
 * pairs, email, mobile, URL, UUID). Keeps client validation consistent with the
 * backend contract — but the server remains the authoritative validator (these are
 * UX pre-checks only).
 */

import { z } from 'zod';
import { REGEX } from '@/constants/app';

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .regex(REGEX.email, 'Enter a valid email address.');
