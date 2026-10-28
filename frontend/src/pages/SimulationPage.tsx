import React, { useState } from 'react';
import { IntegratedSimulationResult } from '../types';
import { runIntegratedSimulation } from '../services/api';
import { PlayCircle, Play } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-blue-600" />
            <span>Integrated Laboratory OS Workflow Simulation</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete End-to-End Simulation: PCB Creation ➜ CPU Scheduling ➜ Concurrency Lock ➜ Banker's Safety ➜ Memory Allocation ➜ Disk Operation ➜ Resource Release
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Configuration Form */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-600" />
            <span>Job Submission Parameters</span>
          </h3>

          <form onSubmit={handleRunSimulation} className="space-y-3">
            <div>
              <label className="text-xs text-slate-700 font-medium">Job Name</label>
              <input
                type="text"
                value={jobName}
                onChange={e => setJobName(e.target.value)}
                required
                className="w-full mt-1 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-700 font-medium">Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as any)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium">Burst (s)</label>
                <input
                  type="number"
                  min={1}
                  value={burstTime}
                  onChange={e => setBurstTime(Number(e.target.value))}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-700 font-medium">Priority (1=High)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={priority}
                  onChange={e => setPriority(Number(e.target.value))}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium">Memory (MB)</label>
                <input
                  type="number"
                  value={memoryReqMB}
                  onChange={e => setMemoryReqMB(Number(e.target.value))}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-700 font-medium">Workstation</label>
                <input
                  type="text"
                  value={targetMachine}
                  onChange={e => setTargetMachine(e.target.value)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-medium">License</label>
                <input
                  type="text"
                  value={licenseRequested}
                  onChange={e => setLicenseRequested(e.target.value)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-xs transition shadow-sm"
            >
              {loading ? 'Simulating Workflow...' : 'Execute Full OS Simulation'}
            </button>
          </form>
        </div>

        {/* Step-by-Step Simulation Execution Timeline */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Execution Timeline Trace
          </h3>

          {!simulationResult ? (
            <div className="text-center text-xs text-slate-500 py-12">
              Configure parameters on the left and click "Execute Full OS Simulation" to trace pipeline.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                  <span className="text-slate-500">Allocated PC:</span>
                  <div className="text-blue-700 font-bold mt-0.5">{simulationResult.finalMetrics.allocatedMachine}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                  <span className="text-slate-500">Allocated Lic:</span>
                  <div className="text-emerald-700 font-bold mt-0.5">{simulationResult.finalMetrics.allocatedLicense}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                  <span className="text-slate-500">Completion:</span>
                  <div className="text-amber-700 font-bold mt-0.5">{simulationResult.finalMetrics.completionTime}s</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                  <span className="text-slate-500">CPU Util:</span>
                  <div className="text-slate-800 font-bold mt-0.5">{simulationResult.finalMetrics.cpuUtilization}%</div>
                </div>
              </div>

              <div className="space-y-2">
                {simulationResult.steps.map(step => (
                  <div key={step.stepIndex} className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-blue-700">
                        Step {step.stepIndex}: {step.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white border border-slate-200 text-slate-600 font-mono">
                        {step.phase}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{step.description}</p>
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
