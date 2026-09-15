/**
 * Payload builders and Zod schemas for the master form dialog.
 * Extracted here so they can be unit-tested independently of the React component.
 */
import { z } from 'zod';
import type { MasterPayload } from './types';

// ── Default form (name_en / name_hi / display_order) ─────────────────────────

export const defaultMasterSchema = z.object({
  name_en: z.string().trim().min(1, 'English name is required.').max(150),
  name_hi: z.string().max(150).optional(),
  display_order: z.string().optional(),
});
export type DefaultMasterValues = z.infer<typeof defaultMasterSchema>;

export function emptyDefaultMasterForm(): DefaultMasterValues {
  return { name_en: '', name_hi: '', display_order: '' };
}

export function buildDefaultMasterPayload(values: DefaultMasterValues): MasterPayload {
  return {
    name_en: values.name_en,
    name_hi: values.name_hi?.trim() || null,
    display_order: values.display_order?.trim() ? Number(values.display_order) : null,
  };
}

// ── Financial Year form (label / start_date / end_date) ───────────────────────

export const financialYearSchema = z
  .object({
    label: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{4}$/, 'Format must be YYYY-YYYY, e.g. 2025-2026.'),
    start_date: z.string().min(1, 'Start date is required.'),
    end_date: z.string().min(1, 'End date is required.'),
  })
  .superRefine((v, ctx) => {
    if (v.start_date && v.end_date && v.end_date < v.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_date'],
        message: 'Must be on or after start date.',
      });
    }
  });
export type FinancialYearValues = z.infer<typeof financialYearSchema>;

export function emptyFinancialYearForm(): FinancialYearValues {
  return { label: '', start_date: '', end_date: '' };
}

export function buildFinancialYearPayload(values: FinancialYearValues): {
  label: string;
  start_date: string;
  end_date: string;
} {
  return { label: values.label, start_date: values.start_date, end_date: values.end_date };
}

// ── Event Type form (name / display_order / required event category) ─────────

export const eventTypeMasterSchema = defaultMasterSchema.extend({
  event_category_id: z.string().min(1, 'Event category is required.'),
});
export type EventTypeMasterValues = z.infer<typeof eventTypeMasterSchema>;

export function emptyEventTypeMasterForm(): EventTypeMasterValues {
  return { name_en: '', name_hi: '', display_order: '', event_category_id: '' };
}

export function buildEventTypeMasterPayload(values: EventTypeMasterValues): MasterPayload & {
  event_category_id: string;
} {
  return {
    ...buildDefaultMasterPayload(values),
    event_category_id: values.event_category_id,
  };
}

// ── Procurement Update Type form (name / display_order / required category) ──

export const procurementUpdateTypeMasterSchema = defaultMasterSchema.extend({
  procurement_update_category_id: z.string().min(1, 'Procurement update category is required.'),
});
export type ProcurementUpdateTypeMasterValues = z.infer<typeof procurementUpdateTypeMasterSchema>;

export function emptyProcurementUpdateTypeMasterForm(): ProcurementUpdateTypeMasterValues {
  return { name_en: '', name_hi: '', display_order: '', procurement_update_category_id: '' };
}

export function buildProcurementUpdateTypeMasterPayload(values: ProcurementUpdateTypeMasterValues): MasterPayload & {
  procurement_update_category_id: string;
} {
  return {
    ...buildDefaultMasterPayload(values),
    procurement_update_category_id: values.procurement_update_category_id,
  };
}

// ── Commodity form (name / description / category / icon) ────────────────────

export const COMMODITY_CATEGORY_OPTIONS = ['Minor Forest Produce', 'Agriculture'] as const;

export const commodityMasterSchema = defaultMasterSchema.extend({
  description_en: z.string().trim().max(1000).optional(),
  description_hi: z.string().trim().max(1000).optional(),
  category: z.string().optional(),
  icon_media_id: z.string().nullable(),
});
export type CommodityMasterValues = z.infer<typeof commodityMasterSchema>;

export function emptyCommodityMasterForm(): CommodityMasterValues {
  return {
    name_en: '',
    name_hi: '',
    display_order: '',
    description_en: '',
    description_hi: '',
    category: '',
    icon_media_id: null,
  };
}

export function buildCommodityMasterPayload(values: CommodityMasterValues): MasterPayload & {
  description_en: string | null;
  description_hi: string | null;
  category: string | null;
  icon_media_id: string | null;
} {
  return {
    ...buildDefaultMasterPayload(values),
    description_en: values.description_en?.trim() || null,
    description_hi: values.description_hi?.trim() || null,
    category: values.category?.trim() || null,
    icon_media_id: values.icon_media_id ?? null,
  };
}

// ── Document Type form (name / display_order / parent family) ────────────────
//
// A Document Type is the sole classification authority for Documents: it parents to
// exactly one Knowledge Category (→ Publications) or Communication Type (→ Notifications)
// (backend DB XOR constraint). The form captures a `document_family` radio choice plus a
// dependent parent select, and the payload ALWAYS sends both `knowledge_category_id` and
// `communication_type_id` — one populated, one explicit `null` — so a family switch always
// resolves unambiguously per the API contract (an update touching either field must supply
// both to avoid ambiguity).

export const DOCUMENT_FAMILY_OPTIONS = ['knowledge_category', 'communication_type'] as const;
export type DocumentFamily = (typeof DOCUMENT_FAMILY_OPTIONS)[number];

export const documentTypeMasterSchema = defaultMasterSchema
  .extend({
    document_family: z.enum(DOCUMENT_FAMILY_OPTIONS, { errorMap: () => ({ message: 'Choose a destination.' }) }),
    parent_id: z.string().min(1, 'A parent category is required.'),
  });
export type DocumentTypeMasterValues = z.infer<typeof documentTypeMasterSchema>;

export function emptyDocumentTypeMasterForm(): DocumentTypeMasterValues {
  return { name_en: '', name_hi: '', display_order: '', document_family: 'knowledge_category', parent_id: '' };
}

export function buildDocumentTypeMasterPayload(values: DocumentTypeMasterValues): MasterPayload & {
  knowledge_category_id: string | null;
  communication_type_id: string | null;
} {
  const isKnowledgeCategory = values.document_family === 'knowledge_category';
  return {
    ...buildDefaultMasterPayload(values),
    knowledge_category_id: isKnowledgeCategory ? values.parent_id : null,
    communication_type_id: isKnowledgeCategory ? null : values.parent_id,
  };
}
