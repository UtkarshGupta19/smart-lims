# SMART-LIMS Demonstration Guide

This guide provides the exact 30-step demonstration sequence to showcase SMART-LIMS for a college PBL evaluation.

---

## 30-Step Acceptance Demonstration Sequence

1. **Open SMART-LIMS**: Navigate to `http://localhost:5173`.
2. **Dashboard Overview**: View live CPU, Memory, Disk utilization gauges and active bottleneck banner.
3. **Create Lab Job**: Go to **CPU Scheduling**, use the "Create New Lab Process" form to submit job `PID P-Demo`.
4. **Inspect PCB**: Verify `P-Demo` appears in PCB table with state `NEW`.
5. **Process State Transitions**: Observe transition to `READY` state.
6. **Run FCFS Scheduling**: Select FCFS algorithm, click "Run Algorithm", inspect Gantt chart & metrics.
7. **Run SJF & SRTF**: Switch algorithm to SJF & SRTF to observe reduced average waiting time.
8. **Run Priority Scheduling**: Test non-preemptive and preemptive priority algorithms.
9. **Run Round Robin (q=2)**: Observe time quantum slices in the Gantt chart.
10. **Run MLQ & MLFQ**: Run Multilevel Queue and Multilevel Feedback Queue algorithms to see queue demotions and promotions.
11. **Demonstrate Starvation & Aging**: Run Preset Scenario I to observe low-priority job aging promotion.
12. **Threads & Background Workers**: Go to **Threads & Workers**, view active TCB entries and multithreading mapping models.
13. **Simulate Race Condition**: Go to **Concurrency & Sync**, click "Simulate Conflict" under Race Condition tab to view corrupted balance vs locked balance.
14. **Peterson's Solution**: Click "Peterson's" under Critical Section Algos tab to view step-by-step mutual exclusion trace.
15. **Producer-Consumer Bounded Buffer**: Click "Run Bounded Buffer" under Producer-Consumer tab to inspect buffer array state.
16. **Dining Philosophers**: Click "Simulate Round Table" under Dining Philosophers tab to see eating/thinking states and fork locks.
17. **Readers-Writers**: Click "Simulate Access" under Readers-Writers tab to inspect reader count and `rw_mutex`.
18. **Sleeping Barber**: Click "Simulate Waiting Room" under Sleeping Barber tab to see barber state and customer eviction when chairs are full.
19. **Deadlock Avoidance**: Go to **Deadlock Engine**, click "Verify Safe State" to execute Banker's Algorithm.
20. **Deadlock Detection**: Click "Detect Cycle" under WFG Cycle Detection to discover circular wait between processes.
21. **Deadlock Recovery**: Click "Preempt Victim" to terminate victim process and release locked resources.
22. **Contiguous Memory Partitions**: Go to **Memory & VM**, test First Fit, Best Fit, and Worst Fit partition allocation.
23. **Page Replacement Algorithms**: Test FIFO, LRU, Optimal, and LFU under Demand Paging.
24. **Demonstrate Belady's Anomaly**: Click "Belady's Anomaly Demo" tab, click "Demonstrate Anomaly" to verify 4 frames produce more page faults than 3 frames under FIFO.
25. **Detect Thrashing**: Observe system thrashing recommendations under memory pressure.
26. **Disk Head Scheduling**: Go to **Disk Management**, test SSTF, SCAN, C-SCAN, LOOK, and C-LOOK.
27. **Disk Trajectory Chart**: Inspect the Recharts line chart showing disk head track movements.
28. **Adaptive Intelligence Engine**: Go to **Adaptive Intelligence**, view explainable decision history and bottleneck analysis tree.
29. **Integrated Lab Simulation**: Go to **Integrated Lab Sim**, fill parameters and click "Execute Full OS Simulation" to view 10-step execution trace.
30. **OS Logs & Safe Shell**: Go to **OS Logs & CLI**, click script buttons (`health_check.sh`, `cpu_monitoring.sh`, `disk_monitoring.sh`) to execute native bash scripts.
