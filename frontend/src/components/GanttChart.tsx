import React from 'react';
import { GanttSegment } from '../types';

interface GanttChartProps {
  segments: GanttSegment[];
  totalTime?: number;
}

const COLORS = [
  'bg-cyan-500/20 border-cyan-500/50 text-cyan-300',
  'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
  'bg-amber-500/20 border-amber-500/50 text-amber-300',
  'bg-indigo-500/20 border-indigo-500/50 text-indigo-300',
  'bg-rose-500/20 border-rose-500/50 text-rose-300',
  'bg-purple-500/20 border-purple-500/50 text-purple-300',
];

export const GanttChart: React.FC<GanttChartProps> = ({ segments }) => {
  if (!segments || segments.length === 0) {
    return <div className="text-slate-500 text-xs italic py-4 text-center">No Gantt execution data available</div>;
  }

  const maxTime = Math.max(...segments.map(s => s.endTime));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>Gantt Execution Timeline (t = 0 to {maxTime}s)</span>
        <span>Total Duration: {maxTime}ms</span>
      </div>

      <div className="flex h-12 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 p-1 gap-1">
        {segments.map((seg, idx) => {
          const duration = seg.endTime - seg.startTime;
          const flexGrow = Math.max(1, duration);
          const colorClass = COLORS[idx % COLORS.length];

          return (
            <div
              key={idx}
              style={{ flex: flexGrow }}
              className={`h-full border rounded-lg flex flex-col items-center justify-center transition-all hover:scale-[1.02] cursor-pointer ${colorClass}`}
              title={`${seg.pid} (${seg.name}): ${seg.startTime}s -> ${seg.endTime}s`}
            >
              <span className="text-xs font-bold font-mono">{seg.pid}</span>
              <span className="text-[10px] text-slate-400 font-mono">{seg.startTime}-{seg.endTime}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
