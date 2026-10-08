import React from 'react';
import { Play } from 'lucide-react';
import { runPresetScenario } from '../services/api';

const SCENARIOS = [
  { id: 'A', name: 'Normal Lab', desc: 'Standard student lab jobs' },
  { id: 'B', name: 'Heavy CPU', desc: 'Long burst ML jobs' },
  { id: 'C', name: 'Memory Pressure', desc: 'High page faults / Thrashing' },
  { id: 'D', name: 'Disk Workload', desc: 'Heavy I/O seek requests' },
  { id: 'E', name: 'Exam Mode', desc: 'Strict priority preemption' },
  { id: 'F', name: 'License Contention', desc: 'Limited MATLAB licenses' },
  { id: 'G', name: 'Race Condition', desc: 'Unsynchronized booking' },
  { id: 'H', name: 'Deadlock', desc: 'Circular machine wait' },
  { id: 'I', name: 'Starvation', desc: 'Low-priority job aging' },
  { id: 'J', name: 'Full Lab Load', desc: 'Mixed stress test' },
];

interface ScenarioRunnerProps {
  onScenarioRan?: (result: any) => void;
}

export const ScenarioRunner: React.FC<ScenarioRunnerProps> = ({ onScenarioRan }) => {
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const handleRun = async (scId: string) => {
    setLoadingId(scId);
    try {
      const res = await runPresetScenario(scId);
      if (onScenarioRan) onScenarioRan(res);
    } catch (err) {
      console.error('Failed to run scenario:', err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Play className="w-4 h-4 text-cyan-400" />
          <span>1-Click Test Scenarios (Backend Evaluated)</span>
        </h3>
        <span className="text-[10px] text-slate-500">Real OS Engine Calculations</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        {SCENARIOS.map(sc => (
          <button
            key={sc.id}
            onClick={() => handleRun(sc.id)}
            disabled={loadingId === sc.id}
            className="flex flex-col items-center p-2 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-cyan-500/10 hover:border-cyan-500/40 text-center transition group disabled:opacity-50"
          >
            <span className="text-xs font-bold text-cyan-400 group-hover:scale-110 transition font-mono">
              Scen {sc.id}
            </span>
            <span className="text-[10px] text-slate-300 font-medium truncate w-full mt-0.5">{sc.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
