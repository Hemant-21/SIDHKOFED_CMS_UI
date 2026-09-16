/**
 * Reports module types — a faithful mirror of the backend's `reports.types.ts`
 * (Sidhkofed-Website `src/modules/dashboard/reports/`). Replaces the six-report Operational
 * Reports catalogue on the "Generate Reports" screen with exactly three: Programme, District
 * Activity Coverage, Commodity-wise. Wire shape is camelCase end-to-end, same convention as the
 * `operational-reports` module this replaces on-screen.
 */

export type ReportKey = 'programme_report' | 'district_activity_coverage' | 'commodity_report';

export type ReportScope = 'cms_operational' | 'public_preview' | 'public_published';

export type ToolkitItemStatus = 'distributed' | 'partially_distributed' | 'not_distributed' | 'not_recorded';

export const TOOLKIT_ITEM_STATUS_LABELS: Record<ToolkitItemStatus, string> = {
  distributed: 'Distributed',
  partially_distributed: 'Partially distributed',
  not_distributed: 'Not distributed',
  not_recorded: 'Not recorded',
};

export interface ToolkitItemDetail {
  toolkitItemId: string;
  toolkitId: string;
  itemNameEn: string;
  itemNameHi: string | null;
  distributionPattern: string;
  defaultGroupSize: number | null;
  defaultQuantityPerUnit: number | null;
  unit: string | null;
  status: ToolkitItemStatus;
}

export interface ToolkitInfo {
  applicable: boolean;
  items: ToolkitItemDetail[];
}

export interface MissingDataCounts {
  missingAttendance: number;
  missingDistrict?: number;
  missingBlock?: number;
}

export interface FinancialYearOption {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  /** True only for the single synthetic "All Financial Years" row. */
  isAllYearsAggregate: boolean;
}

export interface AppliedFilters {
  financialYearId: string;
  financialYearLabel: string;
  programmeIds: string[];
  districtIds: string[];
  blockIds: string[];
  eventTypeIds: string[];
  commodityIds: string[];
  includeUnassignedProgramme: boolean;
}

export type ChartMeasure = 'completed_events' | 'recorded_participants';

export interface ChartDatum {
  key: string;
  label: string;
  value: number | null;
}

export interface ChartDataset {
  measure: ChartMeasure;
  unit: string;
  data: ChartDatum[];
  allUnavailable: boolean;
}

export interface ProgrammeDistrictDrilldown {
  districtId: string | null;
  districtNameEn: string;
  blocksReached: number;
  completedEvents: number;
  recordedParticipants: number | null;
  missing: MissingDataCounts;
  toolkit: ToolkitInfo;
}

export interface ProgrammeReportRow {
  programmeSchemeId: string;
  programmeNameEn: string;
  targetCommoditiesEn: string[];
  districtsReached: number;
  completedEvents: number;
  recordedParticipants: number | null;
  missing: MissingDataCounts;
  toolkit: ToolkitInfo;
  districtDrilldown: ProgrammeDistrictDrilldown[];
}

export interface DistrictProgrammeBreakdown {
  programmeSchemeId: string | null;
  programmeNameEn: string;
  completedEvents: number;
  blocksReached: number;
  recordedParticipants: number | null;
  missing: MissingDataCounts;
}

export interface DistrictBlockBreakdown {
  blockId: string | null;
  blockNameEn: string;
  completedEvents: number;
  recordedParticipants: number | null;
  missing: MissingDataCounts;
}

export interface DistrictEventTypeBreakdown {
  eventTypeId: string;
  eventTypeNameEn: string;
  completedEvents: number;
  recordedParticipants: number | null;
  missing: MissingDataCounts;
}

export interface DistrictReportRow {
  districtId: string | null;
  districtNameEn: string;
  blocksReached: number;
  programmesCovered: number;
  completedEvents: number;
  recordedParticipants: number | null;
  missing: MissingDataCounts;
  toolkit: ToolkitInfo;
  programmeBreakdown: DistrictProgrammeBreakdown[];
  blockBreakdown: DistrictBlockBreakdown[];
  eventTypeBreakdown: DistrictEventTypeBreakdown[];
}

export interface CommodityDistrictBreakdown {
  districtId: string | null;
  districtNameEn: string;
  completedEvents: number;
  blocksReached: number;
  recordedParticipants: number | null;
  missing: MissingDataCounts;
}

export interface CommodityBlockBreakdown {
  districtId: string | null;
  districtNameEn: string;
  blockId: string | null;
  blockNameEn: string;
  completedEvents: number;
  recordedParticipants: number | null;
  missing: MissingDataCounts;
}

export interface CommodityEventTypeBreakdown {
  eventTypeId: string;
  eventTypeNameEn: string;
  completedEvents: number;
  recordedParticipants: number | null;
  missing: MissingDataCounts;
}

export interface CommodityReportRow {
  commodityId: string;
  commodityNameEn: string;
  districtsReached: number;
  completedEvents: number;
  recordedParticipants: number | null;
  missing: MissingDataCounts;
  toolkit: ToolkitInfo;
  districtBreakdown: CommodityDistrictBreakdown[];
  blockBreakdown: CommodityBlockBreakdown[];
  eventTypeBreakdown: CommodityEventTypeBreakdown[];
}

export type ReportRow = ProgrammeReportRow | DistrictReportRow | CommodityReportRow;

export interface ReportResult<Row extends ReportRow = ReportRow> {
  reportKey: ReportKey;
  scope: ReportScope;
  financialYear: FinancialYearOption;
  appliedFilters: AppliedFilters;
  rows: Row[];
  chart: ChartDataset;
  calculationVersion: number;
  generatedAt: string;
}

export interface FilterOptions {
  financialYears: FinancialYearOption[];
  programmes: { id: string; nameEn: string }[];
  districts: { id: string; nameEn: string }[];
  blocks: { id: string; nameEn: string; districtId: string }[];
  eventTypes: { id: string; nameEn: string }[];
  commodities: { id: string; nameEn: string }[];
}

export interface ReportFilterInput {
  financialYearId?: string;
  programmeIds?: string[];
  districtIds?: string[];
  blockIds?: string[];
  eventTypeIds?: string[];
  commodityIds?: string[];
  includeUnassignedProgramme?: boolean;
}
