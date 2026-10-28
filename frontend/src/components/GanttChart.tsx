import React from 'react';
import { GanttSegment } from '../types';

interface GanttChartProps {
  segments: GanttSegment[];
  totalTime?: number;
}

const PROCESS_COLORS: Record<string, string> = {
  P1: 'bg-blue-100 border-blue-400 text-blue-900',
  P2: 'bg-indigo-100 border-indigo-400 text-indigo-900',
  P3: 'bg-emerald-100 border-emerald-400 text-emerald-900',
  P4: 'bg-amber-100 border-amber-400 text-amber-900',
  P5: 'bg-purple-100 border-purple-400 text-purple-900',
  'P-FACULTY': 'bg-blue-200 border-blue-500 text-blue-950 font-bold',
  'P-STUDENT-LONG': 'bg-slate-200 border-slate-400 text-slate-800',
  'P-STARVE': 'bg-rose-100 border-rose-400 text-rose-900',
};

const FALLBACK_PALETTE = [
  'bg-blue-100 border-blue-300 text-blue-900',
  'bg-emerald-100 border-emerald-300 text-emerald-900',
  'bg-indigo-100 border-indigo-300 text-indigo-900',
  'bg-amber-100 border-amber-300 text-amber-900',
  'bg-purple-100 border-purple-300 text-purple-900',
  'bg-teal-100 border-teal-300 text-teal-900',
];

export const GanttChart: React.FC<GanttChartProps> = ({ segments }) => {
  if (!segments || segments.length === 0) {
    return (
      <div className="p-4 bg-slate-50 rounded-md border border-slate-200 text-slate-500 text-xs text-center italic">
        No execution intervals recorded for Gantt chart.
      </div>
    );
  }

  const maxTime = Math.max(...segments.map(s => s.endTime));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
        <span>CPU Execution Timeline (Gantt Chart)</span>
        <span className="font-mono text-slate-500">t = 0s to {maxTime}s (Span: {maxTime}s)</span>
      </div>

      <div className="flex h-14 bg-slate-50 rounded-md border border-slate-300 p-1 gap-1 overflow-x-auto shadow-inner">
        {segments.map((seg, idx) => {
          const duration = seg.endTime - seg.startTime;
          const flexGrow = Math.max(1, duration);
          const isIdle = seg.isIdle || seg.pid === 'IDLE';

          const colorClass = isIdle
            ? 'bg-slate-200/80 border-dashed border-slate-400 text-slate-600'
            : PROCESS_COLORS[seg.pid] || FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length];

          return (
            <div
              key={idx}
              style={{ flex: flexGrow, minWidth: `${Math.max(38, duration * 20)}px` }}
              className={`h-full border rounded flex flex-col items-center justify-center transition hover:brightness-95 cursor-default ${colorClass}`}
              title={`${seg.pid} (${seg.name || (isIdle ? 'CPU Idle' : '')}): ${seg.startTime}s -> ${seg.endTime}s`}
            >
              <span className="text-xs font-bold font-mono truncate px-1">
                {isIdle ? 'IDLE' : seg.pid}
              </span>
              <span className="text-[10px] text-slate-600 font-mono">
                {seg.startTime}-{seg.endTime}s
              </span>
            </div>
          );
        })}
      </div>

      {/* Axis markers */}
      <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
        <span>t=0s</span>
        <span>t={Math.round(maxTime / 2)}s</span>
        <span>t={maxTime}s</span>
      </div>
    </div>
  );
};
