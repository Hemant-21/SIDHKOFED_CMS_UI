'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import type { ProgrammeReportRow } from '../types';
import { ExpandToggle, ParticipantsCell } from './report-shared';
import { ToolkitInfoButton } from './toolkit-info-panel';

function DistrictDrilldown({ programmeName, rows }: { programmeName: string; rows: ProgrammeReportRow['districtDrilldown'] }) {
  if (rows.length === 0) {
    return <EmptyState title="No district data" description="No completed events with a recorded district for this programme." className="my-2" />;
  }

  return (
    <div className="ml-6 space-y-3 rounded-md border border-primary/20 border-l-4 border-l-primary bg-muted/60 p-4 shadow-sm">
      <h4 className="text-xs font-bold uppercase tracking-wide text-primary">District breakdown</h4>
      <div className="overflow-x-auto rounded border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-primary/30 bg-primary/10 text-left text-xs font-bold text-primary">
              <th className="py-1.5 px-3">District</th>
              <th className="py-1.5 px-3">Blocks reached</th>
              <th className="py-1.5 px-3">Completed events</th>
              <th className="py-1.5 px-3">Recorded participants</th>
              <th className="py-1.5 px-3">Toolkit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d, i) => (
              <tr
                key={d.districtId ?? 'not-recorded'}
                className={`border-b border-border last:border-0 hover:bg-primary/5 ${i % 2 === 1 ? 'bg-muted/50' : ''}`}
              >
                <td className="py-1.5 px-3 font-medium text-foreground">{d.districtNameEn}</td>
                <td className="py-1.5 px-3">{d.blocksReached}</td>
                <td className="py-1.5 px-3">{d.completedEvents}</td>
                <td className="py-1.5 px-3">
                  <ParticipantsCell value={d.recordedParticipants} missingAttendance={d.missing.missingAttendance} />
                </td>
                <td className="py-1.5 px-3">
                  <ToolkitInfoButton title={`${programmeName} - ${d.districtNameEn}`} toolkit={d.toolkit} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProgrammeRow({ row, index }: { row: ProgrammeReportRow; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr
        className={`border-b border-border hover:bg-primary/10 ${
          expanded ? 'border-l-4 border-l-primary bg-primary/10' : index % 2 === 1 ? 'bg-muted/50' : ''
        }`}
      >
        <td className="py-2.5 pr-3 align-top">
          <ExpandToggle expanded={expanded} onToggle={() => setExpanded((v) => !v)} label={row.programmeNameEn} />
        </td>
        <td className="py-2.5 pr-3 align-top text-muted-foreground">
          {row.targetCommoditiesEn.length > 0 ? row.targetCommoditiesEn.join(', ') : '-'}
        </td>
        <td className="py-2.5 pr-3 align-top">{row.districtsReached}</td>
        <td className="py-2.5 pr-3 align-top">{row.completedEvents}</td>
        <td className="py-2.5 pr-3 align-top">
          <ParticipantsCell value={row.recordedParticipants} missingAttendance={row.missing.missingAttendance} />
        </td>
        <td className="py-2.5 pr-3 align-top">
          <ToolkitInfoButton title={row.programmeNameEn} toolkit={row.toolkit} />
        </td>
      </tr>
      {expanded ? (
        <tr>
          <td colSpan={6} className="bg-muted/30 py-3">
            <DistrictDrilldown programmeName={row.programmeNameEn} rows={row.districtDrilldown} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function ProgrammeReportTable({ rows }: { rows: ProgrammeReportRow[] }) {
  if (rows.length === 0) {
    return <EmptyState title="No programmes with qualifying activity" description="No completed events matched the selected financial year and filters." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-primary/30 bg-primary/10 text-left text-xs font-bold text-primary">
            <th className="py-2 pr-3">Programme</th>
            <th className="py-2 pr-3">Target commodities</th>
            <th className="py-2 pr-3">Districts reached</th>
            <th className="py-2 pr-3">Completed events</th>
            <th className="py-2 pr-3">Recorded participants</th>
            <th className="py-2 pr-3">Toolkit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <ProgrammeRow key={row.programmeSchemeId} row={row} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
