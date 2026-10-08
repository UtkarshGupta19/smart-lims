# SMART-LIMS System Architecture Document

## Overview
SMART-LIMS is designed with a strict decoupled layer architecture. The React frontend handles visualization and user interactions, sending REST requests to an Express Node.js server. The core logic resides in pure TypeScript algorithm modules under `backend/src/core/`, completely independent of HTTP routing, ensuring unit testability.

```
React Frontend (Vite)
       │
   REST API (JSON)
       │
Express Controllers & Router (`api.ts`)
       │
Smart-LIMS Core OS Engine
  ├── ProcessManager (`ProcessManager.ts`)
  ├── CPUScheduler (`CPUScheduler.ts`)
  ├── ThreadEngine (`ThreadEngine.ts`)
  ├── SynchronizationEngine (`SynchronizationEngine.ts`)
  ├── DeadlockEngine (`DeadlockEngine.ts`)
  ├── MemoryManager (`MemoryManager.ts`)
  ├── FileManager (`FileManager.ts`)
  ├── DiskScheduler (`DiskScheduler.ts`)
  ├── ResourceManager (`ResourceManager.ts`)
  ├── AdaptiveEngine (`AdaptiveEngine.ts`)
  └── SimulationEngine (`SimulationEngine.ts`)
       │
SQLite Database (`better-sqlite3`)
```

---

## Core Engine Modules

1. **Process Manager (`ProcessManager.ts`)**:
   - Manages PCB state machine transitions (`NEW -> READY -> RUNNING -> WAITING -> TERMINATED`).
   - Implements Job Scheduler (Long-Term), Swapper (Mid-Term), and Short-Term dispatchers.

2. **CPU Scheduler (`CPUScheduler.ts`)**:
   - Computes exact metrics for 8 scheduling algorithms (FCFS, SJF, SRTF, Priority NP/P, RR, MLQ, MLFQ).
   - Generates Gantt timeline arrays containing start time, end time, PID, and queue levels.

3. **Deadlock Engine (`DeadlockEngine.ts`)**:
   - Banker's Algorithm evaluates safe sequences using Available vector, Max, Allocation, and Need matrices.
   - Wait-For Graph (WFG) DFS cycle detection identifies deadlocked process sets.
   - Preempts victim processes to restore system safety.

4. **Memory Manager (`MemoryManager.ts`)**:
   - Contiguous partitioning (First Fit, Best Fit, Worst Fit) tracking internal/external fragmentation.
   - Paging logical-to-physical address translation.
   - Demand paging page replacement algorithms (FIFO, LRU, Optimal, LFU) with step-by-step frame state logs.
   - Belady's Anomaly verification module.

5. **Adaptive Intelligence Engine (`AdaptiveEngine.ts`)**:
   - Evaluates system pressure metrics (CPU %, Mem %, Disk %, Page Fault Rate %, Deadlock Risk).
   - Executes deterministic rules to dynamically reconfigure schedulers or trigger memory swapping.
