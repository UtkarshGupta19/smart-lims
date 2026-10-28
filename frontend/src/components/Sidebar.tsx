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
  { id: 'dashboard', label: 'Overview & Metrics', icon: LayoutDashboard },
  { id: 'resources', label: 'Workstations & Licenses', icon: Server },
  { id: 'processes', label: 'Process & CPU Scheduling', icon: Cpu },
  { id: 'concurrency', label: 'Concurrency & Mutex', icon: Repeat },
  { id: 'deadlock', label: 'Deadlock & Banker’s', icon: Lock },
  { id: 'memory', label: 'Memory Allocation', icon: HardDrive },
  { id: 'disk', label: 'Disk Scheduling', icon: Disc },
  { id: 'threads', label: 'Threads & Workers', icon: GitBranch },
  { id: 'adaptive', label: 'Adaptive Intelligence', icon: BrainCircuit },
  { id: 'simulation', label: 'Integrated Lab Workflow', icon: PlayCircle },
  { id: 'logs', label: 'Audit Logs & Diagnostics', icon: Terminal },
  { id: 'docs', label: 'OS Concept Mapping', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white p-3 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Laboratory Modules
        </div>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-xs">
        <div className="font-semibold text-slate-700">OS PBL Prototype</div>
        <div className="text-[11px] text-slate-500 mt-0.5">Educational simulation mode</div>
      </div>
    </aside>
  );
};
