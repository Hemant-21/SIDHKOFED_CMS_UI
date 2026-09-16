'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  CommodityBlockBreakdown,
  CommodityDistrictBreakdown,
  CommodityEventTypeBreakdown,
  CommodityReportRow,
} from '../types';
import { ExpandToggle, ParticipantsCell } from './report-shared';
import { ToolkitInfoButton } from './toolkit-info-panel';

function BreakdownTable<T extends { completedEvents: number; recordedParticipants: number | null; missing: { missingAttendance: number } }>({
  rows,
  labelHeader,
  label,
  emptyMessage,
}: {
  rows: T[];
  labelHeader: string;
  label: (row: T) => string;
  emptyMessage: string;
}) {
  if (rows.length === 0) return <EmptyState title="No data" description={emptyMessage} className="my-2" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="py-1.5 pr-3">{labelHeader}</th>
            <th className="py-1.5 pr-3">Completed events</th>
            <th className="py-1.5 pr-3">Recorded participants</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0">
              <td className="py-1.5 pr-3">{label(r)}</td>
              <td className="py-1.5 pr-3">{r.completedEvents}</td>
              <td className="py-1.5 pr-3">
                <ParticipantsCell value={r.recordedParticipants} missingAttendance={r.missing.missingAttendance} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CommodityDrilldownTabs({ row }: { row: CommodityReportRow }) {
  return (
    <div className="ml-6 border-l border-border pl-4 py-3">
      <Tabs defaultValue="district">
        <TabsList>
          <TabsTrigger value="district">District</TabsTrigger>
          <TabsTrigger value="block">Block</TabsTrigger>
          <TabsTrigger value="eventType">Event type</TabsTrigger>
        </TabsList>
        <TabsContent value="district">
          <BreakdownTable<CommodityDistrictBreakdown>
            rows={row.districtBreakdown}
            labelHeader="District"
            label={(r) => r.districtNameEn}
            emptyMessage="No district data for this commodity."
          />
        </TabsContent>
        <TabsContent value="block">
          <BreakdownTable<CommodityBlockBreakdown>
            rows={row.blockBreakdown}
            labelHeader="Block"
            label={(r) => `${r.districtNameEn} — ${r.blockNameEn}`}
            emptyMessage="No block data for this commodity."
          />
        </TabsContent>
        <TabsContent value="eventType">
          <BreakdownTable<CommodityEventTypeBreakdown>
            rows={row.eventTypeBreakdown}
            labelHeader="Event type"
            label={(r) => r.eventTypeNameEn}
            emptyMessage="No event type data for this commodity."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CommodityRow({ row }: { row: CommodityReportRow }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr className="border-b border-border">
        <td className="py-2.5 pr-3 align-top">
          <ExpandToggle expanded={expanded} onToggle={() => setExpanded((v) => !v)} label={row.commodityNameEn} />
        </td>
        <td className="py-2.5 pr-3 align-top">{row.districtsReached}</td>
        <td className="py-2.5 pr-3 align-top">{row.completedEvents}</td>
        <td className="py-2.5 pr-3 align-top">
          <ParticipantsCell value={row.recordedParticipants} missingAttendance={row.missing.missingAttendance} />
        </td>
        <td className="py-2.5 pr-3 align-top">
          <ToolkitInfoButton title={row.commodityNameEn} toolkit={row.toolkit} />
        </td>
      </tr>
      {expanded ? (
        <tr>
          <td colSpan={5} className="bg-muted/30 py-0">
            <CommodityDrilldownTabs row={row} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function CommodityReportTable({ rows }: { rows: CommodityReportRow[] }) {
  if (rows.length === 0) {
    return <EmptyState title="No commodities with qualifying activity" description="No completed events matched the selected financial year and filters." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="py-2 pr-3">Commodity</th>
            <th className="py-2 pr-3">Districts reached</th>
            <th className="py-2 pr-3">Completed events</th>
            <th className="py-2 pr-3">Recorded participants</th>
            <th className="py-2 pr-3">Toolkit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <CommodityRow key={row.commodityId} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
