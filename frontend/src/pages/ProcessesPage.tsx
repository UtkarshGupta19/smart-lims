import React, { useEffect, useState } from 'react';
import { PCB, SchedulingResult } from '../types';
import { fetchProcesses, createProcess, runCPUScheduling } from '../services/api';
import { GanttChart } from '../components/GanttChart';
import { Cpu, Plus, Play, AlertCircle } from 'lucide-react';

export const ProcessesPage: React.FC = () => {
  const [processes, setProcesses] = useState<PCB[]>([]);
  const [selectedAlgo, setSelectedAlgo] = useState<string>('ROUND_ROBIN');
  const [quantum, setQuantum] = useState<number>(2);
  const [applyAging, setApplyAging] = useState<boolean>(true);
  const [schedulingResult, setSchedulingResult] = useState<SchedulingResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // New process form state
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Student' | 'Faculty' | 'System'>('Student');
  const [burstTime, setBurstTime] = useState<number>(5);
  const [priority, setPriority] = useState<number>(3);
  const [memoryReq, setMemoryReq] = useState<number>(128);

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = async () => {
    try {
      const data = await fetchProcesses();
      setProcesses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProcess({ name, role, burstTime, priority, memoryReq });
      setName('');
      loadProcesses();
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <span>Process Management & CPU Scheduling</span>
          </h2>
          <p className="text-xs text-slate-400">PCB Table, Short-Term Schedulers & Gantt Timeline</p>
        </div>

        {/* Algorithm selector bar */}
        <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800 flex-wrap">
          <select
            value={selectedAlgo}
            onChange={e => setSelectedAlgo(e.target.value)}
            className="bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="FCFS">1. FCFS</option>
            <option value="SJF">2. SJF Non-Preemptive</option>
            <option value="SRTF">3. SRTF (Preemptive)</option>
            <option value="PRIORITY_NP">4. Priority Non-Preemptive</option>
            <option value="PRIORITY_P">5. Priority Preemptive</option>
            <option value="ROUND_ROBIN">6. Round Robin (RR)</option>
            <option value="MLQ">7. Multilevel Queue (MLQ)</option>
            <option value="MLFQ">8. Multilevel Feedback Queue (MLFQ)</option>
          </select>

          {selectedAlgo === 'ROUND_ROBIN' && (
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span>q:</span>
              <input
                type="number"
                min={1}
                max={10}
                value={quantum}
                onChange={e => setQuantum(Number(e.target.value))}
                className="w-12 bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono"
              />
            </div>
          )}

          <button
            onClick={handleRunScheduling}
            disabled={loading}
            className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loading ? 'Evaluating...' : 'Run Algorithm'}</span>
          </button>
        </div>
      </div>

      {/* PCB Table & Create Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Process Creation Form */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Create New Lab Process</span>
          </h3>
          <form onSubmit={handleCreateProcess} className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 font-medium">Process Name</label>
              <input
                type="text"
                placeholder="e.g. MATLAB FFT Sim"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                >
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="System">System</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium">Burst (s)</label>
                <input
                  type="number"
                  min={1}
                  value={burstTime}
                  onChange={e => setBurstTime(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 font-medium">Priority (1=High)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={priority}
                  onChange={e => setPriority(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium">Memory (MB)</label>
                <input
                  type="number"
                  value={memoryReq}
                  onChange={e => setMemoryReq(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg text-xs font-semibold transition"
            >
              Add Process to Job Queue
            </button>
          </form>
        </div>

        {/* PCB Table */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Process Control Block (PCB) Directory
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-mono">
                <tr>
                  <th className="p-2.5">PID</th>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">State</th>
                  <th className="p-2.5">Arrival</th>
                  <th className="p-2.5">Burst</th>
                  <th className="p-2.5">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {processes.map(p => (
                  <tr key={p.pid} className="hover:bg-slate-800/40 transition">
                    <td className="p-2.5 font-bold text-cyan-400">{p.pid}</td>
                    <td className="p-2.5 text-slate-200 font-sans">{p.name}</td>
                    <td className="p-2.5 text-slate-400">{p.role}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {p.state}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-400">{p.arrivalTime}s</td>
                    <td className="p-2.5 text-slate-200">{p.burstTime}s</td>
                    <td className="p-2.5 text-amber-400 font-bold">{p.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Scheduling Results Section */}
      {schedulingResult && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">
              Algorithm Output: <span className="text-cyan-400">{schedulingResult.algorithm}</span>
            </h3>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-400">Avg WT: <strong className="text-white">{schedulingResult.avgWaitingTime}s</strong></span>
              <span className="text-slate-400">Avg TAT: <strong className="text-white">{schedulingResult.avgTurnaroundTime}s</strong></span>
              <span className="text-slate-400">CPU Util: <strong className="text-emerald-400">{schedulingResult.cpuUtilization}%</strong></span>
              <span className="text-slate-400">Context Switches: <strong className="text-amber-400">{schedulingResult.contextSwitches}</strong></span>
            </div>
          </div>

          <GanttChart segments={schedulingResult.ganttChart} />

          {schedulingResult.queueLogs && schedulingResult.queueLogs.length > 0 && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
              <span className="text-slate-400 font-bold block mb-1">Queue Transition & Execution Logs:</span>
              {schedulingResult.queueLogs.map((log, i) => (
                <div key={i} className="text-slate-300">• {log}</div>
              ))}
            </div>
          )}

          {schedulingResult.starvationAlerts && schedulingResult.starvationAlerts.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <strong>Starvation Prevention & Aging Triggered:</strong>
                {schedulingResult.starvationAlerts.map((alert, i) => (
                  <div key={i} className="mt-1">{alert}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
