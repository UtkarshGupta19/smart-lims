import React from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';

export const DocsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>College OS Syllabus Concept Mapping & Documentation</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive Mapping of Operating Systems Curriculum Concepts to Smart-LIMS Backend Implementations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            Module 1: OS Fundamentals & Linux Scripts
          </h3>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2 text-slate-700">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div><strong>System Simulation vs Host OS:</strong> Pure JavaScript simulated kernel structures (PCB, ready queue, memory partitions, disk blocks) distinctly separated from host OS operations.</div>
            </li>
            <li className="flex items-start gap-2 text-slate-700">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div><strong>Whitelisted Shell Diagnostics:</strong> Safe read-only scripts in <code>scripts/</code> for CPU load, RAM status, disk usage, and backup verification without arbitrary shell execution.</div>
            </li>
          </ul>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            Module 2: Process Management & CPU Scheduling
          </h3>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2 text-slate-700">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div><strong>Process Control Block (PCB):</strong> Complete PCB data structure with PID, state transitions (New, Ready, Running, Waiting, Terminated), remaining time, priority, and history audit.</div>
            </li>
            <li className="flex items-start gap-2 text-slate-700">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div><strong>8 Scheduling Algorithms:</strong> FCFS, SJF, SRTF, Non-Preemptive Priority, Preemptive Priority with Aging, Round Robin with quantum, Multilevel Queue, and MLFQ with queue demotion/promotion.</div>
            </li>
          </ul>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            Module 3: Concurrency & Synchronization
          </h3>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2 text-slate-700">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div><strong>Workstation Race Condition vs Mutex:</strong> Demonstrates real double-booking bugs under un-synchronized concurrent requests vs atomic Mutex lock serialization.</div>
            </li>
            <li className="flex items-start gap-2 text-slate-700">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div><strong>Classical IPC Problems:</strong> Producer-Consumer bounded buffer, Readers-Writers synchronization, Dining Philosophers with deadlock avoidance, and Peterson's mutual exclusion algorithm.</div>
            </li>
          </ul>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            Module 4: Deadlocks, Memory & Disk Management
          </h3>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2 text-slate-700">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div><strong>Deadlock Prevention & Banker's Algorithm:</strong> Explanation of Coffman's 4 conditions, Allocation/Max/Need matrices, Banker's safe-sequence evaluator, and tentative request validation.</div>
            </li>
            <li className="flex items-start gap-2 text-slate-700">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div><strong>Dynamic Memory Allocation & Coalescing:</strong> First Fit, Best Fit, and Worst Fit allocation, continuous visual memory map, external fragmentation tracking, and adjacent free block merging on deallocation.</div>
            </li>
            <li className="flex items-start gap-2 text-slate-700">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div><strong>Disk Arm Scheduling:</strong> FCFS, SSTF, SCAN (Elevator), and C-SCAN algorithms with explicit boundary explanations, cylinder range validation, and comparative total head travel calculations.</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
