import React, { useState } from 'react';
import { IntegratedSimulationResult } from '../types';
import { runIntegratedSimulation } from '../services/api';
import { PlayCircle, CheckCircle2, Cpu, HardDrive, ShieldCheck, Play } from 'lucide-react';

export const SimulationPage: React.FC = () => {
  const [jobName, setJobName] = useState('Deep Learning AI Model Training');
  const [role, setRole] = useState<'Student' | 'Faculty'>('Student');
  const [burstTime, setBurstTime] = useState<number>(6);
  const [priority, setPriority] = useState<number>(2);
  const [memoryReqMB, setMemoryReqMB] = useState<number>(256);
  const [targetMachine, setTargetMachine] = useState<string>('PC-01');
  const [licenseRequested, setLicenseRequested] = useState<string>('LIC-MATLAB');
  const [simulationResult, setSimulationResult] = useState<IntegratedSimulationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await runIntegratedSimulation({
        jobName,
        role,
        burstTime,
        priority,
        memoryReqMB,
        targetMachine,
        licenseRequested,
      });
      setSimulationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <PlayCircle className="w-6 h-6 text-cyan-400" />
          <span>Integrated Laboratory OS Workflow Simulation</span>
        </h2>
        <p className="text-xs text-slate-400">Complete End-to-End Simulation: PCB ➜ Scheduling ➜ Concurrency ➜ Banker's Safety ➜ Memory ➜ Disk ➜ Release</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Configuration Form */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-400" />
            <span>Job Submission Parameters</span>
          </h3>

          <form onSubmit={handleRunSimulation} className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 font-medium">Job Name</label>
              <input
                type="text"
                value={jobName}
                onChange={e => setJobName(e.target.value)}
                required
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
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
                  value={memoryReqMB}
                  onChange={e => setMemoryReqMB(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-cyan-500/20"
            >
              {loading ? 'Simulating Workflow...' : 'Execute Full OS Simulation'}
            </button>
          </form>
        </div>

        {/* Step-by-Step Simulation Execution Timeline */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Execution Timeline Trace
          </h3>

          {!simulationResult ? (
            <div className="text-center text-xs text-slate-500 py-12">
              Configure parameters on the left and click "Execute Full OS Simulation" to start.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Allocated PC:</span>
                  <div className="text-cyan-400 font-bold mt-0.5">{simulationResult.finalMetrics.allocatedMachine}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Allocated Lic:</span>
                  <div className="text-emerald-400 font-bold mt-0.5">{simulationResult.finalMetrics.allocatedLicense}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Completion:</span>
                  <div className="text-amber-400 font-bold mt-0.5">{simulationResult.finalMetrics.completionTime}s</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">CPU Util:</span>
                  <div className="text-purple-400 font-bold mt-0.5">{simulationResult.finalMetrics.cpuUtilization}%</div>
                </div>
              </div>

              <div className="space-y-3">
                {simulationResult.steps.map(step => (
                  <div key={step.stepIndex} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-400">
                        Step {step.stepIndex}: {step.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-400 font-mono">
                        {step.phase}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
