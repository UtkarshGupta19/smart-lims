import React, { useEffect, useState, useRef } from 'react';
import { PCB, SchedulingResult } from '../types';
import {
  fetchProcesses,
  createProcess,
  runCPUScheduling,
  stepProcessSimulation,
  resetProcessSimulation,
  deleteProcess,
} from '../services/api';
import { GanttChart } from '../components/GanttChart';
import {
  Cpu,
  Plus,
  Play,
  RotateCcw,
  StepForward,
  Pause,
  Info,
  AlertCircle,
  FileText,
  Trash2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

const PRESET_DATASETS: Record<string, Partial<PCB>[]> = {
  'standard': [
    { name: 'MATLAB Numerical Simulation', user: 'Dr. Alan Turing', role: 'Faculty', arrivalTime: 0, burstTime: 6, priority: 2, memoryReq: 256 },
    { name: 'ANSYS Finite Element Run', user: 'Ada Lovelace', role: 'Student', arrivalTime: 1, burstTime: 4, priority: 3, memoryReq: 512 },
    { name: 'Kernel Daemon Watchdog', user: 'System Daemon', role: 'System', arrivalTime: 2, burstTime: 3, priority: 1, memoryReq: 128 },
    { name: 'Cadence VLSI Circuit Synth', user: 'Claude Shannon', role: 'Faculty', arrivalTime: 3, burstTime: 7, priority: 2, memoryReq: 384 },
    { name: 'Python Data Analysis Script', user: 'Grace Hopper', role: 'Student', arrivalTime: 4, burstTime: 5, priority: 4, memoryReq: 192 },
  ],
  'starvation': [
    { name: 'Critical Lab Exam Grader', user: 'Faculty Supervisor', role: 'Faculty', arrivalTime: 0, burstTime: 4, priority: 1, memoryReq: 256 },
    { name: 'Priority Faculty Benchmark', user: 'Dr. Turing', role: 'Faculty', arrivalTime: 2, burstTime: 5, priority: 1, memoryReq: 256 },
    { name: 'Continuous Student Lab Sim', user: 'Student 1', role: 'Student', arrivalTime: 3, burstTime: 8, priority: 2, memoryReq: 256 },
    { name: 'Low Priority Background Archive', user: 'Student 2', role: 'Student', arrivalTime: 1, burstTime: 4, priority: 8, memoryReq: 128 },
  ],
  'multilevel': [
    { name: 'Kernel Memory Page Daemon', user: 'Core OS', role: 'System', arrivalTime: 0, burstTime: 3, priority: 1, memoryReq: 64 },
    { name: 'Security Policy Validator', user: 'Core OS', role: 'System', arrivalTime: 1, burstTime: 2, priority: 1, memoryReq: 64 },
    { name: 'Faculty Research Model', user: 'Dr. Turing', role: 'Faculty', arrivalTime: 1, burstTime: 6, priority: 2, memoryReq: 512 },
    { name: 'Student Homework Compiler', user: 'Student A', role: 'Student', arrivalTime: 2, burstTime: 5, priority: 4, memoryReq: 128 },
    { name: 'Student Data Cleaning Run', user: 'Student B', role: 'Student', arrivalTime: 3, burstTime: 4, priority: 5, memoryReq: 128 },
  ],
};

export const ProcessesPage: React.FC = () => {
  const [processes, setProcesses] = useState<PCB[]>([]);
  const [selectedAlgo, setSelectedAlgo] = useState<string>('ROUND_ROBIN');
  const [quantum, setQuantum] = useState<number>(2);
  const [applyAging, setApplyAging] = useState<boolean>(true);
  const [schedulingResult, setSchedulingResult] = useState<SchedulingResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // PCB Detail Modal
  const [inspectedPCB, setInspectedPCB] = useState<PCB | null>(null);

  // Simulation controls
  const [simClock, setSimClock] = useState<number>(0);
  const [autoRunning, setAutoRunning] = useState<boolean>(false);
  const [lastSimEvent, setLastSimEvent] = useState<string>('Simulation initialized');
  const autoRunTimerRef = useRef<any>(null);

  // Process creation form
  const [name, setName] = useState('');
  const [user, setUser] = useState('Ada Lovelace');
  const [role, setRole] = useState<'Student' | 'Faculty' | 'System'>('Student');
  const [arrivalTime, setArrivalTime] = useState<number>(0);
  const [burstTime, setBurstTime] = useState<number>(5);
  const [priority, setPriority] = useState<number>(3);
  const [memoryReq, setMemoryReq] = useState<number>(128);

  useEffect(() => {
    loadProcesses();
  }, []);

  useEffect(() => {
    if (autoRunning) {
      autoRunTimerRef.current = setInterval(() => {
        handleStepSimulation();
      }, 1500);
    } else if (autoRunTimerRef.current) {
      clearInterval(autoRunTimerRef.current);
    }
    return () => {
      if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
    };
  }, [autoRunning]);

  const loadProcesses = async () => {
    try {
      const data = await fetchProcesses();
      setProcesses(data);
    } catch (err) {
      console.error('Failed to load processes:', err);
    }
  };

  const handleCreateProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProcess({
        name,
        user,
        role,
        arrivalTime: Number(arrivalTime),
        burstTime: Number(burstTime),
        priority: Number(priority),
        memoryReq: Number(memoryReq),
      });
      setName('');
      await loadProcesses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunScheduling = async () => {
    setLoading(true);
    try {
      const res = await runCPUScheduling(selectedAlgo, processes, quantum, applyAging);
      setSchedulingResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStepSimulation = async () => {
    try {
      const stepRes = await stepProcessSimulation();
      setSimClock(stepRes.clock);
      setLastSimEvent(stepRes.event);
      await loadProcesses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetSimulation = async () => {
    if (!window.confirm('Reset the current process simulation state back to t=0?')) {
      return;
    }
    setAutoRunning(false);
    try {
      await resetProcessSimulation();
      setSimClock(0);
      setLastSimEvent('Simulation reset to t=0');
      await loadProcesses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProcess = async (pid: string) => {
    if (!window.confirm(`Terminate process ${pid}?`)) return;
    try {
      await deleteProcess(pid);
      if (inspectedPCB?.pid === pid) setInspectedPCB(null);
      await loadProcesses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadPreset = async (presetKey: string) => {
    const preset = PRESET_DATASETS[presetKey];
    if (!preset) return;
    if (!window.confirm(`Load preset '${presetKey}'? This will replace the current job queue.`)) return;

    try {
      await resetProcessSimulation();
      for (const p of processes) {
        await deleteProcess(p.pid);
      }
      for (const item of preset) {
        await createProcess(item);
      }
      setSchedulingResult(null);
      await loadProcesses();
    } catch (err) {
      console.error('Failed to load preset:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <span>CPU Scheduling Laboratory & PCB Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Process control block state machine, short-term schedulers, dynamic aging & Gantt chart analytics
          </p>
        </div>

        {/* Live Simulation Step Controller */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm text-xs">
          <div className="flex items-center gap-1.5 px-2 font-mono text-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Clock: <strong className="text-slate-900 font-bold">t = {simClock}s</strong></span>
          </div>

          <div className="w-px h-4 bg-slate-200" />

          <button
            onClick={handleStepSimulation}
            className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-medium flex items-center gap-1 transition"
            title="Advance 1 simulation time unit"
          >
            <StepForward className="w-3.5 h-3.5 text-blue-600" />
            <span>Step Tick</span>
          </button>

          <button
            onClick={() => setAutoRunning(!autoRunning)}
            className={`px-2.5 py-1 rounded border font-medium flex items-center gap-1 transition ${
              autoRunning
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
            }`}
          >
            {autoRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{autoRunning ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            onClick={handleResetSimulation}
            className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 font-medium flex items-center gap-1 transition"
            title="Reset simulation to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Algorithm Config & Evaluation Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Algorithm</label>
            <select
              value={selectedAlgo}
              onChange={e => setSelectedAlgo(e.target.value)}
              className="border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="FCFS">1. FCFS (First-Come First-Served)</option>
              <option value="SJF">2. SJF (Shortest Job First - Non-Preemptive)</option>
              <option value="SRTF">3. SRTF (Shortest Remaining Time First - Preemptive)</option>
              <option value="PRIORITY_NP">4. Priority (Non-Preemptive)</option>
              <option value="PRIORITY_P">5. Priority (Preemptive)</option>
              <option value="ROUND_ROBIN">6. Round Robin (RR)</option>
              <option value="MLQ">7. Multilevel Queue (MLQ: System, Faculty, Student)</option>
              <option value="MLFQ">8. Multilevel Feedback Queue (MLFQ with Aging)</option>
            </select>
          </div>

          {(selectedAlgo === 'ROUND_ROBIN' || selectedAlgo === 'MLQ') && (
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Time Quantum (q)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={quantum}
                onChange={e => setQuantum(Number(e.target.value))}
                className="w-16 border border-slate-300 rounded px-2 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          )}

          {(selectedAlgo === 'ROUND_ROBIN' || selectedAlgo === 'PRIORITY_P') && (
            <div className="flex items-center gap-1.5 pt-4">
              <input
                type="checkbox"
                id="aging-toggle"
                checked={applyAging}
                onChange={e => setApplyAging(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="aging-toggle" className="text-xs font-medium text-slate-700 cursor-pointer">
                Enable Dynamic Aging (Mitigate Starvation)
              </label>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Load Sample Dataset</label>
            <select
              onChange={e => e.target.value && handleLoadPreset(e.target.value)}
              defaultValue=""
              className="border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white"
            >
              <option value="" disabled>-- Select Preset --</option>
              <option value="standard">Standard Lab Batch</option>
              <option value="starvation">Starvation & Aging Scenario</option>
              <option value="multilevel">Multilevel Hierarchy Mix</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleRunScheduling}
          disabled={loading || processes.length === 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{loading ? 'Evaluating...' : 'Run Scheduling Algorithm'}</span>
        </button>
      </div>

      {/* Process Creation Form & PCB Directory Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Form (1 Col) */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center gap-1.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Submit New Laboratory Job</span>
          </div>

          <form onSubmit={handleCreateProcess} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Job / Process Name</label>
              <input
                type="text"
                placeholder="e.g. ANSYS Stress Analysis"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full mt-1 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">User Name</label>
                <input
                  type="text"
                  value={user}
                  onChange={e => setUser(e.target.value)}
                  required
                  className="w-full mt-1 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Role / Job Class</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full mt-1 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 bg-white"
                >
                  <option value="Student">Student (Normal)</option>
                  <option value="Faculty">Faculty (Priority)</option>
                  <option value="System">System (Highest)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Arrival Time (s)</label>
                <input
                  type="number"
                  min={0}
                  value={arrivalTime}
                  onChange={e => setArrivalTime(Number(e.target.value))}
                  required
                  className="w-full mt-1 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">CPU Burst (s)</label>
                <input
                  type="number"
                  min={1}
                  value={burstTime}
                  onChange={e => setBurstTime(Number(e.target.value))}
                  required
                  className="w-full mt-1 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Priority (1 = Highest)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={priority}
                  onChange={e => setPriority(Number(e.target.value))}
                  required
                  className="w-full mt-1 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Memory Req (MB)</label>
                <input
                  type="number"
                  min={32}
                  step={32}
                  value={memoryReq}
                  onChange={e => setMemoryReq(Number(e.target.value))}
                  required
                  className="w-full mt-1 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded text-xs transition shadow-sm"
            >
              Enqueue Process in Job Pool
            </button>
          </form>
        </div>

        {/* PCB Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Process Control Block (PCB) Directory</span>
            </h3>
            <span className="text-[11px] text-slate-500">Click process for PCB record</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs lab-table">
              <thead>
                <tr>
                  <th>PID</th>
                  <th>Job Name</th>
                  <th>User / Role</th>
                  <th>State</th>
                  <th>Arrival</th>
                  <th>Burst / Rem</th>
                  <th>Priority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {processes.map(p => {
                  const stateColor =
                    p.state === 'RUNNING'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : p.state === 'READY'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : p.state === 'WAITING'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : p.state === 'TERMINATED'
                      ? 'bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-purple-100 text-purple-800 border-purple-300';

                  return (
                    <tr
                      key={p.pid}
                      onClick={() => setInspectedPCB(p)}
                      className="cursor-pointer transition hover:bg-blue-50/50"
                      title="Click to view complete PCB data structure"
                    >
                      <td className="font-bold text-blue-700">{p.pid}</td>
                      <td className="font-sans font-medium text-slate-800">{p.name}</td>
                      <td className="font-sans text-slate-600">
                        {p.user || p.role} <span className="text-[10px] text-slate-400">({p.role})</span>
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${stateColor}`}>
                          {p.state}
                        </span>
                      </td>
                      <td className="text-slate-600">{p.arrivalTime}s</td>
                      <td className="text-slate-800">
                        {p.burstTime}s <span className="text-slate-400">({p.remainingTime}s)</span>
                      </td>
                      <td className="text-slate-900 font-bold">{p.priority}</td>
                      <td>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteProcess(p.pid);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                          title="Terminate process"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PCB Inspection Modal */}
      {inspectedPCB && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-300 shadow-xl max-w-xl w-full p-5 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  PCB Record: {inspectedPCB.pid} — {inspectedPCB.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectedPCB(null)}
                className="text-slate-400 hover:text-slate-700 text-xs px-2 py-1 rounded"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 font-medium">Assigned User:</span>
                <div className="font-semibold text-slate-800 mt-0.5">{inspectedPCB.user || 'Student'}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 font-medium">Current State:</span>
                <div className="font-semibold text-blue-700 mt-0.5">{inspectedPCB.state}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 font-mono">
                <span className="text-slate-500 font-medium">Arrival / Burst:</span>
                <div className="font-semibold text-slate-800 mt-0.5">
                  AT: {inspectedPCB.arrivalTime}s | BT: {inspectedPCB.burstTime}s | Rem: {inspectedPCB.remainingTime}s
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 font-mono">
                <span className="text-slate-500 font-medium">Priority / Resources:</span>
                <div className="font-semibold text-slate-800 mt-0.5">
                  Pri: {inspectedPCB.priority} | RAM: {inspectedPCB.memoryReq}MB | Disk: {inspectedPCB.diskReq}MB
                </div>
              </div>
            </div>

            {/* State Transition History */}
            <div className="space-y-1.5 text-xs">
              <span className="font-semibold text-slate-700">State Transition Log (Audit Trail):</span>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 max-h-36 overflow-y-auto space-y-1 font-mono text-[11px]">
                {inspectedPCB.stateHistory && inspectedPCB.stateHistory.length > 0 ? (
                  inspectedPCB.stateHistory.map((h, i) => (
                    <div key={i} className="text-slate-700 flex items-start gap-2">
                      <span className="text-blue-600 font-bold">[t={h.timestamp}s]</span>
                      <span>
                        {h.from} ➜ <strong>{h.to}</strong>: {h.reason}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 italic">Initial state: NEW</div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setInspectedPCB(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheduling Results Section */}
      {schedulingResult && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Algorithm Evaluation: <span className="text-blue-600">{schedulingResult.algorithm}</span>
              </h3>
              <p className="text-xs text-slate-500">Gantt execution intervals and computed process turnaround & waiting times</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-600">Avg WT: <strong className="text-slate-900 font-bold">{schedulingResult.avgWaitingTime}s</strong></span>
              <span className="text-slate-600">Avg TAT: <strong className="text-slate-900 font-bold">{schedulingResult.avgTurnaroundTime}s</strong></span>
              <span className="text-slate-600">CPU Util: <strong className="text-emerald-700 font-bold">{schedulingResult.cpuUtilization}%</strong></span>
              <span className="text-slate-600">Switches: <strong className="text-slate-900 font-bold">{schedulingResult.contextSwitches}</strong></span>
            </div>
          </div>

          {/* Gantt Chart Component */}
          <GanttChart segments={schedulingResult.ganttChart} />

          {/* Per-Process Metrics Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs lab-table">
              <thead>
                <tr>
                  <th>PID</th>
                  <th>Job Name</th>
                  <th>Arrival Time</th>
                  <th>Burst Time</th>
                  <th>Priority</th>
                  <th>Completion Time</th>
                  <th>Turnaround Time</th>
                  <th>Waiting Time</th>
                  <th>Response Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {schedulingResult.processes.map(p => (
                  <tr key={p.pid}>
                    <td className="font-bold text-blue-700">{p.pid}</td>
                    <td className="font-sans font-medium text-slate-800">{p.name}</td>
                    <td>{p.arrivalTime}s</td>
                    <td>{p.burstTime}s</td>
                    <td className="font-bold">{p.priority}</td>
                    <td className="font-bold text-slate-900">{p.completionTime}s</td>
                    <td className="text-blue-800 font-semibold">{p.turnaroundTime}s</td>
                    <td className="text-emerald-800 font-semibold">{p.waitingTime}s</td>
                    <td className="text-slate-600">{p.responseTime}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Step-by-step Ready Queue & Scheduling Decision Explanations */}
          {schedulingResult.decisionSteps && schedulingResult.decisionSteps.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Step-by-Step Scheduling Decisions & Ready Queue States:
              </span>
              <div className="bg-slate-50 p-3 rounded border border-slate-200 max-h-48 overflow-y-auto space-y-1.5 font-mono text-xs">
                {schedulingResult.decisionSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-700">
                    <span className="text-blue-700 font-bold min-w-[50px]">[t={step.time}s]</span>
                    <span className="text-slate-500 min-w-[120px]">
                      Ready: [{step.readyQueue.join(', ') || 'Empty'}]
                    </span>
                    <span className="text-slate-800 font-sans">{step.decisionReason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Starvation & Aging Alerts */}
          {schedulingResult.starvationAlerts && schedulingResult.starvationAlerts.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Priority Aging Triggered (Starvation Prevention):</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5 font-mono text-[11px]">
                  {schedulingResult.starvationAlerts.map((alert, i) => (
                    <li key={i}>{alert}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
