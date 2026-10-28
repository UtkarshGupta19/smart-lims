import React, { useEffect, useState } from 'react';
import {
  runBankerAlgo,
  validateBankerRequest,
  runDeadlockDetect,
  runDeadlockRecover,
  fetchDeadlockConditions,
} from '../services/api';
import {
  Lock,
  ShieldCheck,
  AlertOctagon,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Send,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const DeadlockPage: React.FC = () => {
  const [conditions, setConditions] = useState<any[]>([]);
  const [bankerResult, setBankerResult] = useState<any>(null);
  const [detectResult, setDetectResult] = useState<any>(null);
  const [recoveryResult, setRecoveryResult] = useState<any>(null);

  // Default Editable Matrices State
  const [processes] = useState<string[]>(['P1', 'P2', 'P3', 'P4']);
  const [resources] = useState<string[]>(['PC-01', 'MATLAB', 'ANSYS']);
  const [available, setAvailable] = useState<number[]>([3, 3, 2]);
  const [maxMatrix, setMaxMatrix] = useState<number[][]>([
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
  ]);
  const [allocMatrix, setAllocMatrix] = useState<number[][]>([
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
  ]);

  // Resource Request Form State
  const [requestPid, setRequestPid] = useState<string>('P1');
  const [reqR0, setReqR0] = useState<number>(1);
  const [reqR1, setReqR1] = useState<number>(0);
  const [reqR2, setReqR2] = useState<number>(2);
  const [requestResult, setRequestResult] = useState<any>(null);

  useEffect(() => {
    loadConditions();
    handleRunBanker();
  }, []);

  const loadConditions = async () => {
    try {
      const data = await fetchDeadlockConditions();
      setConditions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const getNeedMatrix = () => {
    return maxMatrix.map((row, i) =>
      row.map((val, j) => Math.max(0, val - allocMatrix[i][j]))
    );
  };

  const handleRunBanker = async () => {
    try {
      const matrix = {
        processes,
        resources,
        available,
        max: maxMatrix,
        allocation: allocMatrix,
        need: getNeedMatrix(),
      };
      const res = await runBankerAlgo(matrix);
      setBankerResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleValidateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const matrix = {
        processes,
        resources,
        available,
        max: maxMatrix,
        allocation: allocMatrix,
        need: getNeedMatrix(),
      };
      const requestVector = [Number(reqR0), Number(reqR1), Number(reqR2)];
      const res = await validateBankerRequest(matrix, requestPid, requestVector);
      setRequestResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunDetect = async () => {
    try {
      const res = await runDeadlockDetect();
      setDetectResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunRecover = async () => {
    try {
      const res = await runDeadlockRecover();
      setRecoveryResult(res);
      await handleRunDetect();
    } catch (err) {
      console.error(err);
    }
  };

  const needMatrix = getNeedMatrix();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <span>Deadlock Avoidance & Banker’s Safety Algorithm</span>
          </h2>
          <p className="text-xs text-slate-500">
            Coffman conditions, resource allocation state matrices, safe sequence evaluation & cycle recovery
          </p>
        </div>
      </div>

      {/* 4 Necessary Deadlock Conditions Educational Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>The Four Necessary Deadlock Conditions (Coffman Conditions)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {conditions.map(c => (
            <div key={c.condition} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">{c.condition}</div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{c.explanation}</p>
              <div className="text-[10px] text-blue-700 bg-blue-50/80 p-1.5 rounded border border-blue-100">
                <strong>Lab Scenario:</strong> {c.labExample}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Allocation State Matrices Table */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Resource Allocation State (Allocation, Max, Need & Available)
            </h3>
            <span className="text-[11px] text-slate-500">
              Formula: Need[i][j] = Max[i][j] - Allocation[i][j]
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="font-bold text-slate-700">Available Vector:</span>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded font-bold">
              [{available.join(', ')}] ({resources.join(', ')})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs lab-table">
            <thead>
              <tr>
                <th className="text-left">Process</th>
                <th colSpan={resources.length}>Allocation Matrix</th>
                <th colSpan={resources.length}>Maximum Demand</th>
                <th colSpan={resources.length}>Calculated Need Matrix</th>
              </tr>
              <tr className="bg-slate-50 text-[10px] font-mono text-slate-500">
                <th className="text-left">PID</th>
                {resources.map(r => <th key={`a-${r}`}>{r}</th>)}
                {resources.map(r => <th key={`m-${r}`}>{r}</th>)}
                {resources.map(r => <th key={`n-${r}`}>{r}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {processes.map((p, idx) => (
                <tr key={p}>
                  <td className="text-left font-bold text-blue-700">{p}</td>
                  {allocMatrix[idx].map((val, j) => (
                    <td key={`alloc-${idx}-${j}`} className="text-slate-800">{val}</td>
                  ))}
                  {maxMatrix[idx].map((val, j) => (
                    <td key={`max-${idx}-${j}`} className="text-slate-500">{val}</td>
                  ))}
                  {needMatrix[idx].map((val, j) => (
                    <td key={`need-${idx}-${j}`} className="font-bold text-blue-900 bg-blue-50/40">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Columns: Banker Safety Runner & Safe-State Request Validator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Banker's Safety Algorithm Output */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Banker’s Safety Sequence Evaluator</span>
            </h3>
            <button
              onClick={handleRunBanker}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
            >
              Verify Safe State
            </button>
          </div>

          {bankerResult && (
            <div className="space-y-3">
              <div
                className={`p-3 rounded border text-xs font-semibold flex items-center justify-between ${
                  bankerResult.isSafe
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                <span>State: {bankerResult.isSafe ? 'SAFE STATE' : 'UNSAFE STATE'}</span>
                {bankerResult.isSafe && (
                  <span className="font-mono">
                    Safe Sequence: <strong>{bankerResult.safeSequence.join(' ➜ ')}</strong>
                  </span>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1 font-mono text-xs max-h-48 overflow-y-auto">
                <span className="font-bold text-slate-700 block mb-1">Work Vector Derivation:</span>
                {bankerResult.stepLogs.map((log: string, i: number) => (
                  <div key={i} className="text-slate-600 text-[11px] leading-relaxed">• {log}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Safe-State Validation for Dynamic Request */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-4 h-4 text-blue-600" />
              <span>Safe-State Resource-Request Algorithm</span>
            </h3>
            <p className="text-xs text-slate-500">Test if granting an immediate request preserves system safety</p>
          </div>

          <form onSubmit={handleValidateRequest} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Requesting Process</label>
              <select
                value={requestPid}
                onChange={e => setRequestPid(e.target.value)}
                className="w-full mt-1 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white"
              >
                {processes.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">{resources[0]}</label>
                <input
                  type="number"
                  min={0}
                  value={reqR0}
                  onChange={e => setReqR0(Number(e.target.value))}
                  className="w-full mt-1 border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">{resources[1]}</label>
                <input
                  type="number"
                  min={0}
                  value={reqR1}
                  onChange={e => setReqR1(Number(e.target.value))}
                  className="w-full mt-1 border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">{resources[2]}</label>
                <input
                  type="number"
                  min={0}
                  value={reqR2}
                  onChange={e => setReqR2(Number(e.target.value))}
                  className="w-full mt-1 border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition"
            >
              Evaluate Request with Banker's Algorithm
            </button>
          </form>

          {requestResult && (
            <div
              className={`p-3 rounded border text-xs space-y-1 ${
                requestResult.canGrant
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {requestResult.canGrant ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>Verdict: {requestResult.canGrant ? 'GRANT REQUEST' : 'REJECT / DELAY REQUEST'}</span>
              </div>
              <div className="text-[11px] leading-relaxed">{requestResult.reason}</div>
            </div>
          )}
        </div>
      </div>

      {/* Deadlock Detection & Recovery Section */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>Wait-For Graph (WFG) Cycle Detection & Deadlock Recovery</span>
            </h3>
            <p className="text-xs text-slate-500">
              Depth-first search cycle detection in resource dependency graphs with victim process preemption
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRunDetect}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded text-xs font-semibold"
            >
              Detect Cycles
            </button>
            <button
              onClick={handleRunRecover}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-semibold"
            >
              Recover / Preempt Victim
            </button>
          </div>
        </div>

        {detectResult && (
          <div className="space-y-3 text-xs">
            <div
              className={`p-3 rounded border font-semibold ${
                detectResult.hasDeadlock
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}
            >
              {detectResult.hasDeadlock
                ? `DEADLOCK DETECTED! Circular wait cycle among processes: ${detectResult.deadlockedProcesses.join(', ')}`
                : 'No Circular Dependency Detected in Wait-For Graph.'}
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-[11px] space-y-1">
              <div className="font-bold text-slate-700">Wait-For Graph Edges:</div>
              {detectResult.waitForGraphEdges.map((e: any, i: number) => (
                <div key={i} className="text-slate-800">
                  {e.from} ──[ waiting for {e.resource} ]──► {e.to}
                </div>
              ))}
            </div>
          </div>
        )}

        {recoveryResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-900 font-mono">
            <strong>Recovery Report: </strong>
            <span>{recoveryResult.recoveryLog}</span>
          </div>
        )}
      </div>
    </div>
  );
};
