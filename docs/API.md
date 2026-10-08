# SMART-LIMS REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. System & Monitoring APIs

### `GET /system/metrics`
Returns real-time aggregated OS metrics (CPU %, Memory %, Disk %, Active Processes, Bottleneck status).

### `GET /system/monitor/:script`
Executes safe Linux shell script (`health_check.sh`, `cpu_monitoring.sh`, `memory_monitoring.sh`, `disk_monitoring.sh`, `process_monitoring.sh`, `user_management.sh`, `backup.sh`).

---

## 2. Process Management & CPU Scheduling APIs

### `GET /processes`
Returns array of all PCB objects in the directory.

### `POST /processes`
Creates a new process job.
- **Body**: `{ name: string, role: string, burstTime: number, priority: number, memoryReq: number }`

### `POST /scheduling/run`
Executes CPU scheduling algorithm.
- **Body**: `{ algorithm: "FCFS"|"SJF"|"SRTF"|"PRIORITY_NP"|"PRIORITY_P"|"ROUND_ROBIN"|"MLQ"|"MLFQ", processes: PCB[], quantum?: number }`
- **Response**: `{ avgWaitingTime, avgTurnaroundTime, cpuUtilization, throughput, contextSwitches, ganttChart, processes }`

---

## 3. Concurrency & Synchronization APIs

### `POST /synchronization/race-condition`
Executes race condition comparison (No lock vs With lock).

### `POST /synchronization/critical-section`
Executes Peterson's, Test-and-Set, or Semaphore algorithm trace.

### `POST /synchronization/bounded-buffer`
Simulates Producer-Consumer bounded buffer.

---

## 4. Deadlock Engine APIs

### `POST /deadlock/banker`
Runs Banker's Algorithm safe sequence check.

### `POST /deadlock/detect`
Performs WFG cycle detection for deadlocks.

---

## 5. Memory & Disk Management APIs

### `POST /memory/allocate`
Evaluates First Fit, Best Fit, or Worst Fit contiguous allocation.

### `POST /memory/page-replacement`
Evaluates FIFO, LRU, Optimal, or LFU page replacement sequence.

### `POST /disk/schedule`
Evaluates disk head scheduling algorithms (FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK).

---

## 6. Integrated Simulation & Scenario APIs

### `POST /simulation/run`
Runs complete 10-step laboratory OS job simulation workflow.

### `POST /scenarios/run/:scenarioId`
Runs preset demo scenario (A through J).
