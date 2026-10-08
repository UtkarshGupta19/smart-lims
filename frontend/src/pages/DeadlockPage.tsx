import { useState } from 'react';
import { runBankerAlgo, runDeadlockDetect, runDeadlockRecover } from '../services/api';
import { Lock, ShieldCheck, AlertOctagon, RefreshCw } from 'lucide-react';

export const DeadlockPage = () => {
  const [bankerResult, setBankerResult] = useState<any>(null);
  const [detectResult, setDetectResult] = useState<any>(null);
  const [recoveryResult, setRecoveryResult] = useState<any>(null);

  const handleRunBanker = async () => setBankerResult(await runBankerAlgo());
  const handleRunDetect = async () => setDetectResult(await runDeadlockDetect());
  const handleRunRecover = async () => setRecoveryResult(await runDeadlockRecover());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Lock className="w-6 h-6 text-cyan-400" />
          <span>Deadlock Management & Resource Safety Engine</span>
        </h2>
        <p className="text-xs text-slate-400">Banker's Algorithm, Resource Allocation Graph (RAG), WFG Cycle Detection & Victim Recovery</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Banker's Algorithm Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Banker's Avoidance Algorithm</span>
            </h3>
            <button
              onClick={handleRunBanker}
              className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg text-xs"
            >
              Verify Safe State
            </button>
          </div>

          {bankerResult && (
            <div className="space-y-3">
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                bankerResult.isSafe ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                <span>State: {bankerResult.isSafe ? 'SAFE STATE' : 'UNSAFE STATE'}</span>
                {bankerResult.isSafe && <span>Safe Sequence: {bankerResult.safeSequence.join(' ➜ ')}</span>}
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
                <div className="text-slate-400 font-bold mb-1">Safety Step Execution Logs:</div>
                {bankerResult.stepLogs.map((log: string, i: number) => (
                  <div key={i} className="text-slate-300">• {log}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Deadlock Detection & Recovery Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Wait-For Graph Cycle Detection</span>
            </h3>
            <div className="flex gap-2">
              <button onClick={handleRunDetect} className="px-3 py-1.5 bg-rose-500/20 text-rose-300 text-xs rounded-lg font-semibold border border-rose-500/40">
                Detect Cycle
              </button>
              <button onClick={handleRunRecover} className="px-3 py-1.5 bg-slate-800 text-cyan-400 text-xs rounded-lg font-semibold border border-slate-700">
                Preempt Victim
              </button>
            </div>
          </div>

          {detectResult && (
            <div className="space-y-3">
              <div className={`p-3 rounded-xl border text-xs font-bold ${
                detectResult.hasDeadlock ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                {detectResult.hasDeadlock
                  ? `CIRCULAR DEADLOCK DETECTED! Processes: ${detectResult.deadlockedProcesses.join(', ')}`
                  : 'No Circular Dependency Detected'}
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
                <div className="text-slate-400 font-bold mb-1">Wait-For Graph (WFG) Edges:</div>
                {detectResult.waitForGraphEdges.map((e: any, i: number) => (
                  <div key={i} className="text-cyan-400 font-bold">
                    {e.from} ──[ waiting for {e.resource} ]──► {e.to}
                  </div>
                ))}
              </div>
            </div>
          )}

          {recoveryResult && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300 font-mono">
              <div className="font-bold">Recovery Execution Report:</div>
              <div className="mt-1">{recoveryResult.recoveryLog}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
