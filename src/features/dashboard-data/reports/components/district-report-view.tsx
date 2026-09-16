'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  DistrictBlockBreakdown,
  DistrictEventTypeBreakdown,
  DistrictProgrammeBreakdown,
  DistrictReportRow,
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

function DistrictDrilldownTabs({ row }: { row: DistrictReportRow }) {
  return (
    <div className="ml-6 border-l border-border pl-4 py-3">
      <Tabs defaultValue="programme">
        <TabsList>
          <TabsTrigger value="programme">Programme</TabsTrigger>
          <TabsTrigger value="block">Block</TabsTrigger>
          <TabsTrigger value="eventType">Event type</TabsTrigger>
        </TabsList>
        <TabsContent value="programme">
          <BreakdownTable<DistrictProgrammeBreakdown>
            rows={row.programmeBreakdown}
            labelHeader="Programme"
            label={(r) => r.programmeNameEn}
            emptyMessage="No programme-linked completed events for this district."
          />
        </TabsContent>
        <TabsContent value="block">
          <BreakdownTable<DistrictBlockBreakdown>
            rows={row.blockBreakdown}
            labelHeader="Block"
            label={(r) => r.blockNameEn}
            emptyMessage="No block data for this district."
          />
        </TabsContent>
        <TabsContent value="eventType">
          <BreakdownTable<DistrictEventTypeBreakdown>
            rows={row.eventTypeBreakdown}
            labelHeader="Event type"
            label={(r) => r.eventTypeNameEn}
            emptyMessage="No event type data for this district."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DistrictRow({ row }: { row: DistrictReportRow }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr className="border-b border-border">
        <td className="py-2.5 pr-3 align-top">
          <ExpandToggle expanded={expanded} onToggle={() => setExpanded((v) => !v)} label={row.districtNameEn} />
        </td>
        <td className="py-2.5 pr-3 align-top">{row.blocksReached}</td>
        <td className="py-2.5 pr-3 align-top">{row.programmesCovered}</td>
        <td className="py-2.5 pr-3 align-top">{row.completedEvents}</td>
        <td className="py-2.5 pr-3 align-top">
          <ParticipantsCell value={row.recordedParticipants} missingAttendance={row.missing.missingAttendance} />
        </td>
        <td className="py-2.5 pr-3 align-top">
          <ToolkitInfoButton title={row.districtNameEn} toolkit={row.toolkit} />
        </td>
      </tr>
      {expanded ? (
        <tr>
          <td colSpan={6} className="bg-muted/30 py-0">
            <DistrictDrilldownTabs row={row} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function DistrictReportTable({ rows }: { rows: DistrictReportRow[] }) {
  if (rows.length === 0) {
    return <EmptyState title="No districts with qualifying activity" description="No completed events matched the selected financial year and filters." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="py-2 pr-3">District</th>
            <th className="py-2 pr-3">Blocks reached</th>
            <th className="py-2 pr-3">Programmes covered</th>
            <th className="py-2 pr-3">Completed events</th>
            <th className="py-2 pr-3">Recorded participants</th>
            <th className="py-2 pr-3">Toolkit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <DistrictRow key={row.districtId ?? 'not-recorded'} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
