import React, { useState } from 'react';
import { Play, RotateCcw, CheckCircle, AlertTriangle, BookOpen, ChevronRight } from 'lucide-react';
import { runPresetScenario } from '../services/api';

interface ScenarioDef {
  id: string;
  code: string;
  name: string;
  concept: string;
  explanation: string;
}

const PBL_DEMO_SCENARIOS: ScenarioDef[] = [
  {
    id: 'RR',
    code: 'Demo 1',
    name: 'Round Robin CPU Scheduling',
    concept: 'CPU Time-Sharing & Time Quantum',
    explanation: 'Demonstrates round-robin preemptive time-slicing (q=2s) across a batch of student and faculty lab jobs with turnaround & waiting time computation.',
  },
  {
    id: 'PRIORITY',
    code: 'Demo 2',
    name: 'Priority Preemption & Aging',
    concept: 'Starvation Mitigation via Dynamic Aging',
    explanation: 'Simulates a high-priority faculty job preempting student jobs, and activates dynamic aging to boost starving low-priority background processes.',
  },
  {
    id: 'RACE',
    code: 'Demo 3',
    name: 'Resource Booking Concurrency',
    concept: 'Critical Section & Mutex Mutual Exclusion',
    explanation: 'Reproduces a race condition where two concurrent student booking requests double-book Workstation PC-01, then proves mutual exclusion with Mutex locks.',
  },
  {
    id: 'BANKER',
    code: 'Demo 4',
    name: 'Banker’s Deadlock Avoidance',
    concept: 'Safe State Verification & Unsafe Request Rejection',
    explanation: 'Tests current laboratory allocation state for a safe execution sequence, then tests an excessive resource request and rejects it to prevent circular wait.',
  },
  {
    id: 'MEMORY',
    code: 'Demo 5',
    name: 'Memory Allocation Comparison',
    concept: 'Contiguous Allocation & External Fragmentation',
    explanation: 'Evaluates First Fit vs Best Fit partition placement for memory requests, calculating internal vs external fragmentation metrics.',
  },
  {
    id: 'DISK',
    code: 'Demo 6',
    name: 'Disk Scheduling Comparator',
    concept: 'Cylinder Seek Optimization',
    explanation: 'Compares FCFS, SSTF, SCAN (Elevator), and C-SCAN on an identical cylinder request queue from initial head track 53.',
  },
];

interface ScenarioRunnerProps {
  onScenarioRan?: () => void;
}

export const ScenarioRunner: React.FC<ScenarioRunnerProps> = ({ onScenarioRan }) => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDef>(PBL_DEMO_SCENARIOS[0]);
  const [activeResult, setActiveResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRunScenario = async () => {
    setLoading(true);
    try {
      const res = await runPresetScenario(selectedScenario.id);
      setActiveResult(res.result);
      if (onScenarioRan) onScenarioRan();
    } catch (err) {
      console.error('Failed to run scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetScenario = () => {
    setActiveResult(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Demonstration Laboratory Scenarios (College PBL Evaluator)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Reproducible operating-systems evaluation benchmarks executed deterministically by the backend engine
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeResult && (
            <button
              onClick={handleResetScenario}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-medium flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Output</span>
            </button>
          )}
          <button
            onClick={handleRunScenario}
            disabled={loading}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loading ? 'Evaluating...' : `Run ${selectedScenario.code}`}</span>
          </button>
        </div>
      </div>

      {/* Scenario Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PBL_DEMO_SCENARIOS.map(sc => {
          const isSelected = selectedScenario.id === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => {
                setSelectedScenario(sc);
                setActiveResult(null);
              }}
              className={`text-left p-2.5 rounded-md border text-xs transition ${
                isSelected
                  ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="font-mono text-[10px] text-blue-600 uppercase font-bold">{sc.code}</div>
              <div className="font-medium truncate mt-0.5">{sc.name}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Scenario Info Card */}
      <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <span className="font-bold text-slate-800">{selectedScenario.concept}: </span>
          <span className="text-slate-600">{selectedScenario.explanation}</span>
        </div>
      </div>

      {/* Computed Results Viewer */}
      {activeResult && (
        <div className="bg-slate-50 p-4 rounded border border-slate-300 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 font-sans">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Execution Results: {selectedScenario.name}</span>
            </div>
            <span className="text-[11px] text-slate-500">Computed by pure TS backend algorithm</span>
          </div>

          {/* Scenario specific rendering */}
          {selectedScenario.id === 'RR' && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-4 text-slate-700">
                <span>Avg Waiting Time: <strong className="text-slate-900">{activeResult.avgWaitingTime}s</strong></span>
                <span>Avg Turnaround Time: <strong className="text-slate-900">{activeResult.avgTurnaroundTime}s</strong></span>
                <span>CPU Utilization: <strong className="text-emerald-700">{activeResult.cpuUtilization}%</strong></span>
                <span>Context Switches: <strong className="text-slate-900">{activeResult.contextSwitches}</strong></span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200 text-[11px] text-slate-700">
                Timeline: {activeResult.ganttChart.map((g: any) => `${g.pid} (${g.startTime}-${g.endTime}s)`).join(' ➜ ')}
              </div>
            </div>
          )}

          {selectedScenario.id === 'PRIORITY' && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-4 text-slate-700">
                <span>Algorithm: <strong className="text-slate-900">{activeResult.algorithm}</strong></span>
                <span>Context Switches: <strong className="text-slate-900">{activeResult.contextSwitches}</strong></span>
                <span>Avg WT: <strong className="text-slate-900">{activeResult.avgWaitingTime}s</strong></span>
              </div>
              {activeResult.starvationAlerts && activeResult.starvationAlerts.length > 0 && (
                <div className="p-2 bg-amber-50 border border-amber-300 rounded text-amber-800 text-[11px]">
                  <strong>Aging Triggered: </strong>
                  {activeResult.starvationAlerts.join('; ')}
                </div>
              )}
            </div>
          )}

          {selectedScenario.id === 'RACE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-rose-50 border border-rose-200 p-3 rounded text-rose-900 text-xs font-sans">
                <div className="font-bold flex items-center gap-1.5 text-rose-700 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Unsynchronized Execution</span>
                </div>
                <div>Status: Double booking occurred!</div>
                <div className="text-[11px] mt-1 text-rose-800 font-mono">
                  Granted: {activeResult.unsynchronized.grantedBookings.join(', ')}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded text-emerald-900 text-xs font-sans">
                <div className="font-bold flex items-center gap-1.5 text-emerald-700 mb-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mutex Synchronized Execution</span>
                </div>
                <div>Status: Exactly 1 reservation confirmed. Zero double bookings.</div>
                <div className="text-[11px] mt-1 text-emerald-800 font-mono">
                  Owner: {activeResult.synchronized.finalOwner}
                </div>
              </div>
            </div>
          )}

          {selectedScenario.id === 'BANKER' && (
            <div className="space-y-2 font-sans text-xs">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900">
                <strong>Base State Verification: </strong>
                {activeResult.safeVerification.isSafe ? 'SAFE STATE' : 'UNSAFE STATE'}
                {activeResult.safeVerification.isSafe && (
                  <span className="font-mono ml-2 font-bold">
                    Safe Sequence: {activeResult.safeVerification.safeSequence.join(' ➜ ')}
                  </span>
                )}
              </div>
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-900">
                <strong>Unsafe Request Test: </strong>
                {activeResult.unsafeRequestTest.reason}
              </div>
            </div>
          )}

          {selectedScenario.id === 'MEMORY' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans text-xs">
              <div className="bg-white p-3 rounded border border-slate-200">
                <div className="font-bold text-slate-800">First Fit Results:</div>
                <div className="text-slate-600 mt-1">Internal Frag: {activeResult.firstFit.totalInternalFragmentation} MB</div>
                <div className="text-slate-600">External Frag: {activeResult.firstFit.totalExternalFragmentation} MB</div>
              </div>
              <div className="bg-white p-3 rounded border border-slate-200">
                <div className="font-bold text-slate-800">Best Fit Results:</div>
                <div className="text-slate-600 mt-1">Internal Frag: {activeResult.bestFit.totalInternalFragmentation} MB</div>
                <div className="text-slate-600">External Frag: {activeResult.bestFit.totalExternalFragmentation} MB</div>
              </div>
            </div>
          )}

          {selectedScenario.id === 'DISK' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs bg-white rounded border border-slate-200">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-2">Algorithm</th>
                    <th className="p-2">Total Head Movement</th>
                    <th className="p-2">Average Seek</th>
                    <th className="p-2">Seek Path</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {activeResult.comparison.map((item: any) => (
                    <tr key={item.algorithm}>
                      <td className="p-2 font-bold font-sans text-blue-900">{item.algorithm}</td>
                      <td className="p-2 font-bold">{item.totalHeadMovement} tracks</td>
                      <td className="p-2">{item.avgSeekDistance} tracks</td>
                      <td className="p-2 text-slate-600">{item.seekSequence.join(' ➜ ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
