/**
 * Reusable relationship pickers (Phase 15.3). The shared "link surface" every content
 * module composes — bounded master-data options, the server-side searchable relation
 * picker, the media picker dialog, and the RHF-bound cover-image field. Built once here
 * so no module duplicates link logic.
 *
 * `useMasterOptions` loads bounded reference lists (event-types, districts, commodities…)
 * eagerly — correct for small dropdowns. Large CONTENT relations
 * (programmes/institutions/galleries/documents/events) use the paginated, server-side
 * {@link RelationPicker} instead of loading every row (Phase 15.3 remediation — Finding 4).
 */
export { useMasterOptions } from './use-options';
export { useFinancialYearOptions, useReportingPeriodOptions } from './period-pickers';
export { type RelationOption } from './relation-search';
export { RelationPicker } from './relation-picker';
export { RelationMultiSelectField, RelationSelect, toRelationValue } from './relation-fields';
export { uploadMedia, type MediaItem } from './media-api';
export { MediaPickerDialog } from './media-picker-dialog';
export { CoverMediaField } from './cover-media-field';
