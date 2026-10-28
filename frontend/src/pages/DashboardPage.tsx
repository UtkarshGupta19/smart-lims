import React, { useEffect, useState } from 'react';
import { SystemMetrics, LabMachine } from '../types';
import { fetchMetrics, fetchMachines, fetchAdaptiveHistory } from '../services/api';
import { Cpu, HardDrive, Server, Clock, CheckCircle2, AlertTriangle, Activity, ArrowRight, ShieldCheck } from 'lucide-react';
import { ScenarioRunner } from '../components/ScenarioRunner';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [machines, setMachines] = useState<LabMachine[]>([]);
  const [latestDecision, setLatestDecision] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [m, mac, hist] = await Promise.all([fetchMetrics(), fetchMachines(), fetchAdaptiveHistory()]);
      setMetrics(m);
      setMachines(mac);
      if (hist && hist.length > 0) setLatestDecision(hist[0]);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* PBL Demo Scenarios Bar */}
      <ScenarioRunner onScenarioRan={loadData} />

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Laboratory Management System Overview</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time operating system metrics calculated dynamically from active simulator state
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded border border-slate-200">
          Algorithm: <strong className="text-slate-800">{metrics?.currentSchedulingAlgorithm || 'ROUND_ROBIN'}</strong> | Ready Queue: <strong className="text-blue-700">{metrics?.readyQueueLength || 0}</strong>
        </div>
      </div>

      {/* Core OS Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Machine Availability */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Workstation Availability</span>
            <Server className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {metrics?.availableMachines || 0} / {metrics?.totalMachines || 0}
            </span>
            <span className="text-xs text-slate-500">online</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{
                width: `${metrics?.totalMachines ? (metrics.availableMachines / metrics.totalMachines) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* CPU Utilization */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Simulated CPU Load</span>
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {metrics?.cpuUtilization || 0}%
            </span>
            <span className="text-xs text-slate-500">derived load</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, metrics?.cpuUtilization || 0)}%` }}
            />
          </div>
        </div>

        {/* Memory Pressure */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Simulated Memory Usage</span>
            <HardDrive className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {metrics?.memoryUtilization || 0}%
            </span>
            <span className="text-xs text-slate-500">RAM allocation</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, metrics?.memoryUtilization || 0)}%` }}
            />
          </div>
        </div>

        {/* Deadlock Status */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Deadlock Avoidance Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700">
              {metrics?.deadlockStatus || 'SAFE'}
            </span>
            <span className="text-xs text-slate-500">Banker active</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Licenses: <strong className="text-slate-800">{metrics?.availableLicenses}</strong> free / {metrics?.totalLicenses}
          </div>
        </div>
      </div>

      {/* Process & Job Queue State Counter */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="text-xs font-semibold text-slate-600 mb-3 flex items-center justify-between">
          <span>Active Operating System Job Pipeline (Simulated Process States)</span>
          <span className="text-[11px] text-slate-500 font-mono">Total Processes: {metrics?.activeProcesses || 0}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">New / Pending</div>
            <div className="text-xl font-bold font-mono text-slate-800 mt-1">{metrics?.pendingJobs || 0}</div>
          </div>
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded">
            <div className="text-[11px] font-semibold text-blue-800 uppercase">Ready Queue</div>
            <div className="text-xl font-bold font-mono text-blue-900 mt-1">{metrics?.readyQueueLength || 0}</div>
          </div>
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded">
            <div className="text-[11px] font-semibold text-emerald-800 uppercase">Running (CPU)</div>
            <div className="text-xl font-bold font-mono text-emerald-900 mt-1">{metrics?.runningJobs || 0}</div>
          </div>
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded">
            <div className="text-[11px] font-semibold text-amber-800 uppercase">Waiting (I/O)</div>
            <div className="text-xl font-bold font-mono text-amber-900 mt-1">{metrics?.waitingProcesses || 0}</div>
          </div>
          <div className="p-2.5 bg-slate-100 border border-slate-200 rounded">
            <div className="text-[11px] font-semibold text-slate-600 uppercase">Terminated</div>
            <div className="text-xl font-bold font-mono text-slate-700 mt-1">{metrics?.completedJobs || 0}</div>
          </div>
        </div>
      </div>

      {/* Two Columns: Machines Status & Recent Process Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lab Machines Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-4 h-4 text-blue-600" />
              <span>Lab Computer Workstations Status</span>
            </h3>
            <span className="text-[11px] text-slate-500">Resource Registry</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs lab-table">
              <thead>
                <tr>
                  <th>Machine ID</th>
                  <th>Name</th>
                  <th>Specs (RAM / Disk)</th>
                  <th>Status</th>
                  <th>Assigned User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {machines.map(m => (
                  <tr key={m.id}>
                    <td className="font-bold text-blue-700 font-mono">{m.id}</td>
                    <td className="font-sans font-medium text-slate-800">{m.name}</td>
                    <td className="text-slate-600">
                      {m.currentMemoryUsageMB}/{m.ramMB}MB RAM | {m.diskGB}GB
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        m.status === 'OCCUPIED'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : m.status === 'MAINTENANCE' || !m.isAvailable
                          ? 'bg-slate-200 text-slate-700 border border-slate-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {m.status || (m.isAvailable ? 'AVAILABLE' : 'MAINTENANCE')}
                      </span>
                    </td>
                    <td className="font-sans text-slate-600 truncate max-w-[140px]">
                      {m.assignedUser || <span className="text-slate-400 italic">None (Free)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Process & Booking Events (1 Col) */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-600" />
              <span>Recent Activity Audit</span>
            </h3>
            <span className="text-[11px] text-slate-500">Live Logs</span>
          </div>

          <div className="space-y-2 text-xs">
            {metrics?.recentEvents && metrics.recentEvents.length > 0 ? (
              metrics.recentEvents.map((evt, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="font-bold text-blue-700 uppercase">{evt.module}</span>
                    <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-700 text-[11px] mt-1 font-sans leading-relaxed">
                    {evt.message}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-400 italic text-xs py-4 text-center">
                No recent activity recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
