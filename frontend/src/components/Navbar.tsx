import React from 'react';
import { Cpu, ShieldCheck, Activity, Terminal, Server, Clock } from 'lucide-react';
import { SystemMetrics } from '../types';

interface NavbarProps {
  metrics: SystemMetrics | null;
  onOpenLogs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ metrics, onOpenLogs }) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-sm">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Smart-LIMS
            </h1>
            <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
              OS Laboratory Simulator
            </span>
          </div>
          <p className="text-xs text-slate-500">College Laboratory Information & Operating Systems PBL Management</p>
        </div>
      </div>

      {metrics && (
        <div className="flex items-center gap-4 text-xs">
          {/* Quick Real Stats */}
          <div className="hidden md:flex items-center gap-4 bg-slate-50 px-3.5 py-1.5 rounded-md border border-slate-200 text-slate-600">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Sim CPU: <strong className="text-slate-900 font-mono">{metrics.cpuUtilization}%</strong></span>
            </div>
            <div className="w-px h-3.5 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Memory: <strong className="text-slate-900 font-mono">{metrics.memoryUtilization}%</strong></span>
            </div>
            <div className="w-px h-3.5 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-slate-500" />
              <span>Workstations: <strong className="text-slate-900 font-mono">{metrics.availableMachines}/{metrics.totalMachines}</strong> Free</span>
            </div>
            <div className="w-px h-3.5 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Ready Q: <strong className="text-slate-900 font-mono">{metrics.readyQueueLength}</strong></span>
            </div>
          </div>

          {/* System Logs trigger */}
          <button
            onClick={onOpenLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition border border-slate-300"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-600" />
            <span>Activity Logs & Shell</span>
          </button>
        </div>
      )}
    </header>
  );
};
