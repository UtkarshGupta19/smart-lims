# Operating System Syllabus Concept Mapping

This document details how every Operating System textbook syllabus topic is explicitly implemented within SMART-LIMS.

---

| OS Concept | SMART-LIMS Implementation Location | How It Is Implemented / Simulated |
|---|---|---|
| **System Calls & User/Kernel Space** | `backend/src/routes/api.ts` | REST API routes act as system call interfaces into the core engine. |
| **Linux Shell Scripting & Monitoring** | `scripts/*.sh` | Native bash scripts for CPU load, memory, disk, process list, user audit, backup, and health check. |
| **Process Control Block (PCB)** | `backend/src/types.ts`, `ProcessManager.ts` | Complete PCB structure storing PID, state, arrival time, burst time, remaining time, priority, memory requirement. |
| **Process State Transitions** | `ProcessManager.ts` | Validates transitions between `NEW`, `READY`, `RUNNING`, `WAITING`, and `TERMINATED`. |
| **Schedulers (Long, Mid, Short Term)**| `ProcessManager.ts` | Long-term admits jobs to memory, Mid-term swaps out under pressure, Short-term dispatches to CPU. |
| **CPU Scheduling (8 Algos)** | `CPUScheduler.ts` | FCFS, SJF, SRTF, Priority NP/P, RR, MLQ, MLFQ with Gantt timeline output. |
| **Aging & Starvation** | `CPUScheduler.ts` | Increases priority of waiting processes over time during Round Robin & MLFQ execution. |
| **Process vs Thread / TCB** | `ThreadEngine.ts` | TCB attributes (TID, PID, stack size, user/kernel thread IDs) & Multithreading mapping models. |
| **Race Condition** | `SynchronizationEngine.ts` | Simulates unsynchronized concurrent balance updates showing lost update data corruption vs mutex lock. |
| **Critical Section Algorithms** | `SynchronizationEngine.ts` | Peterson's solution step trace, Test-and-Set spinlock, and Counting Semaphores. |
| **Classical IPC Problems** | `SynchronizationEngine.ts` | Bounded Buffer, Dining Philosophers round table, Readers-Writers, Sleeping Barber. |
| **Banker's Algorithm** | `DeadlockEngine.ts` | Safe state calculation using Available, Max, Allocation, Need matrices. |
| **Deadlock Detection (WFG)** | `DeadlockEngine.ts` | Cycle detection on Wait-For Graph via DFS to identify deadlocked processes. |
| **Memory Allocation** | `MemoryManager.ts` | First Fit, Best Fit, Worst Fit contiguous partitioning with fragmentation metrics. |
| **Paging & Address Translation** | `MemoryManager.ts` | Logical address -> Page Number + Offset -> Physical Frame address translation. |
| **Page Replacement Algorithms** | `MemoryManager.ts` | FIFO, LRU, Optimal, LFU with step-by-step frame state logs. |
| **Belady's Anomaly** | `MemoryManager.ts` | Proves page faults increase from 9 to 10 when frames increase from 3 to 4 under FIFO. |
| **Disk Scheduling Algorithms** | `DiskScheduler.ts` | FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK seek distance comparator and Recharts head movement trajectory. |
| **Adaptive OS Intelligence** | `AdaptiveEngine.ts` | Deterministic rule-based engine analyzing system bottlenecks and executing dynamic scheduler updates. |
