import React from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';

export const DocsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <span>College OS Syllabus Concept Mapping & Documentation</span>
        </h2>
        <p className="text-xs text-slate-400">Comprehensive Mapping of Operating Systems Curriculum Concepts to SMART-LIMS Backend Implementations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-cyan-400 border-b border-slate-800 pb-2">Module 1: OS Fundamentals & Linux CLI</h3>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div><strong>System Calls & Kernel Space:</strong> REST API routes interact safely with the core TS OS engine.</div>
            </li>
            <li className="flex items-start gap-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div><strong>Linux Shell Scripts:</strong> Safe monitoring scripts located in <code>scripts/</code> for CPU, Memory, Disk, and Backup.</div>
            </li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-cyan-400 border-b border-slate-800 pb-2">Module 2: Process Management & CPU Scheduling</h3>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div><strong>Process Control Block (PCB):</strong> Complete PCB data structure with PID, state transitions, remaining time, priority.</div>
            </li>
            <li className="flex items-start gap-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div><strong>8 Scheduling Algorithms:</strong> FCFS, SJF, SRTF, Priority NP/P, Round Robin, MLQ, MLFQ with Gantt timeline generation.</div>
            </li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-cyan-400 border-b border-slate-800 pb-2">Module 3: Concurrency & Deadlocks</h3>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div><strong>Race Condition & Peterson's:</strong> Demonstrates lost updates vs atomic locks and Peterson's mutual exclusion.</div>
            </li>
            <li className="flex items-start gap-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div><strong>Banker's Algorithm & WFG Cycle:</strong> Deadlock avoidance safe state check and Wait-For Graph cycle detection.</div>
            </li>
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-cyan-400 border-b border-slate-800 pb-2">Module 4: Memory & Disk Management</h3>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div><strong>Partitions & Demand Paging:</strong> First/Best/Worst Fit contiguous allocation, FIFO/LRU/Optimal page replacement & Belady's anomaly.</div>
            </li>
            <li className="flex items-start gap-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div><strong>Disk Scheduling:</strong> FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK seek distance comparator.</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
