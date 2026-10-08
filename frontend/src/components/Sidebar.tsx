import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  GitBranch,
  Repeat,
  Lock,
  HardDrive,
  Disc,
  Server,
  BrainCircuit,
  PlayCircle,
  Terminal,
  BookOpen,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'processes'
  | 'threads'
  | 'concurrency'
  | 'deadlock'
  | 'memory'
  | 'disk'
  | 'resources'
  | 'adaptive'
  | 'simulation'
  | 'logs'
  | 'docs';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const NAV_ITEMS: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'processes', label: 'CPU Scheduling', icon: Cpu },
  { id: 'threads', label: 'Threads & Workers', icon: GitBranch },
  { id: 'concurrency', label: 'Concurrency & Sync', icon: Repeat },
  { id: 'deadlock', label: 'Deadlock Engine', icon: Lock },
  { id: 'memory', label: 'Memory & VM', icon: HardDrive },
  { id: 'disk', label: 'Disk Management', icon: Disc },
  { id: 'resources', label: 'Lab Resources', icon: Server },
  { id: 'adaptive', label: 'Adaptive Intelligence', icon: BrainCircuit },
  { id: 'simulation', label: 'Integrated Lab Sim', icon: PlayCircle },
  { id: 'logs', label: 'OS Logs & CLI', icon: Terminal },
  { id: 'docs', label: 'OS Concepts Map', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md p-4 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          OS Modules
        </div>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs">
        <div className="text-slate-400 font-medium">Smart-LIMS Kernel v1.0</div>
        <div className="text-[10px] text-slate-500 mt-0.5">Deterministic OS Engine</div>
      </div>
    </aside>
  );
};
