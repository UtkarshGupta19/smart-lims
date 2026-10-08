import React, { useEffect, useState } from 'react';
import { SystemMetrics, LabMachine } from '../types';
import { fetchMetrics, fetchMachines, fetchAdaptiveHistory } from '../services/api';
import { Cpu, HardDrive, Disc, ShieldCheck, Activity, Users, AlertTriangle } from 'lucide-react';
import { ScenarioRunner } from '../components/ScenarioRunner';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [machines, setMachines] = useState<LabMachine[]>([]);
  const [latestDecision, setLatestDecision] = useState<any>(null);

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
    }
  };

  return (
    <div className="space-y-6">
      <ScenarioRunner onScenarioRan={loadData} />

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">CPU Utilization</span>
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{metrics?.cpuUtilization || 0}%</span>
            <span className="text-xs text-slate-500">Multiprocessor load</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-cyan-400 h-full transition-all duration-500" style={{ width: `${metrics?.cpuUtilization || 0}%` }} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Memory Pressure</span>
            <HardDrive className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{metrics?.memoryUtilization || 0}%</span>
            <span className="text-xs text-slate-500">Paging & Frames</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${metrics?.memoryUtilization || 0}%` }} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Disk I/O Usage</span>
            <Disc className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{metrics?.diskUtilization || 0}%</span>
            <span className="text-xs text-slate-500">Seek queues</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${metrics?.diskUtilization || 0}%` }} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Deadlock Engine</span>
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400 font-mono">{metrics?.deadlockStatus || 'SAFE'}</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">Banker's Safety Check Active</p>
        </div>
      </div>

      {/* Adaptive Decision Engine Showcase Card */}
      {latestDecision && (
        <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 p-5 rounded-2xl border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-cyan-400" />
              <span>Latest Adaptive Intelligence Decision</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{new Date(latestDecision.timestamp).toLocaleTimeString()}</span>
          </div>
          <div className="text-sm font-semibold text-white">{latestDecision.decision}</div>
          <p className="text-xs text-slate-300">{latestDecision.reason}</p>
          <div className="text-[11px] text-cyan-300 font-mono pt-1">
            Recommended Algorithm: <strong>{latestDecision.algorithmRecommended}</strong>
          </div>
        </div>
      )}

      {/* Lab Machines Status Grid */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Active Laboratory Machines Status</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {machines.map(m => (
            <div key={m.id} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-cyan-400">{m.id}</span>
                <span className={`w-2 h-2 rounded-full ${m.isAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              </div>
              <div className="text-xs text-slate-300 font-medium truncate">{m.name}</div>
              <div className="text-[10px] text-slate-500 font-mono">
                {m.activeProcessCount} active jobs | {m.ramMB / 1024}GB RAM
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
