import React from 'react';
import { Cpu, ShieldCheck, Activity, Terminal, AlertTriangle } from 'lucide-react';
import { SystemMetrics } from '../types';

interface NavbarProps {
  metrics: SystemMetrics | null;
  onOpenLogs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ metrics, onOpenLogs }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            SMART-LIMS
          </h1>
          <p className="text-xs text-slate-400 font-mono">Adaptive OS Laboratory Resource Management System</p>
        </div>
      </div>

      {metrics && (
        <div className="flex items-center gap-6 text-xs">
          {/* Active Bottleneck Banner */}
          <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 font-semibold ${
            metrics.currentBottleneck !== 'NONE'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <AlertTriangle className="w-4 h-4" />
            <span>Bottleneck: {metrics.currentBottleneck || 'OPTIMAL'}</span>
          </div>

          {/* Quick Stats */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-950/60 px-4 py-1.5 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-300">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>CPU: <strong className="text-white font-mono">{metrics.cpuUtilization}%</strong></span>
            </div>
            <div className="w-px h-4 bg-slate-800" />
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Mem: <strong className="text-white font-mono">{metrics.memoryUtilization}%</strong></span>
            </div>
            <div className="w-px h-4 bg-slate-800" />
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Deadlock: <strong className="text-emerald-400">{metrics.deadlockStatus}</strong></span>
            </div>
          </div>

          {/* System Logs trigger */}
          <button
            onClick={onOpenLogs}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition border border-slate-700"
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>OS Logs</span>
          </button>
        </div>
      )}
    </header>
  );
};
