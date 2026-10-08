# SMART-LIMS
### Adaptive Operating-System-Based Laboratory Resource Management System

SMART-LIMS is a college Operating Systems Problem-Based Learning (PBL) project that models a university computer laboratory as a modern Operating System environment.

Rather than being a simple CRUD laboratory booking application, SMART-LIMS implements actual Operating System core algorithms in TypeScript in the backend engine to intelligently manage lab processes, scheduling, threads, concurrency, deadlocks, memory, disks, and resource allocations.

---

## 🌟 Key Features

1. **Module 1 — OS Fundamentals & Safe Linux CLI**:
   - System call abstraction & kernel metrics.
   - Safe Linux shell scripts for CPU, Memory, Disk, Process, User audit, Backup, and Health monitoring (`scripts/`).
   - Virtual Machine / Hypervisor & GPU CUDA parallel computing conceptual simulation.

2. **Module 2 — Process Management**:
   - Complete PCB (Process Control Block) data structure.
   - State transition machine: `NEW -> READY -> RUNNING -> WAITING -> TERMINATED`.
   - Long-term (job admission), Mid-term (swapper), and Short-term CPU schedulers.

3. **Module 3 — CPU Scheduling Engine**:
   - 8 Fully Implemented Real Algorithms:
     1. FCFS (First-Come First-Served)
     2. SJF (Shortest Job First - Non-Preemptive)
     3. SRTF (Shortest Remaining Time First - Preemptive)
     4. Priority (Non-Preemptive)
     5. Priority (Preemptive)
     6. Round Robin (with time quantum & aging)
     7. Multilevel Queue (MLQ: System, Faculty, Student)
     8. Multilevel Feedback Queue (MLFQ: Promotion & Demotion)
   - Real-time Gantt Chart generation, context switch counter, CPU utilization, throughput, waiting time, and turnaround time metrics.

4. **Module 4 — Thread Management**:
   - TCB (Thread Control Block) directory & multithreading mapping models (Many-to-One, One-to-One, Many-to-Many).
   - Real background workers for system monitoring, logging, backup, and health checking.

5. **Module 5 — Concurrency & Synchronization**:
   - Race condition visualizer comparing unsynchronized lost updates vs mutex locks.
   - Critical section algorithms: Lock Variable, Strict Alternation, Peterson's Solution, Test-and-Set Lock, Counting Semaphores.
   - 4 Classical Concurrency Problems:
     1. Bounded Buffer (Producer-Consumer)
     2. Dining Philosophers (5 philosophers round table)
     3. Readers-Writers (Read/Write mutex)
     4. Sleeping Barber (Waiting room chairs & barber sleeping state)

6. **Module 6 — Deadlock Engine**:
   - Banker's Algorithm for safe sequence verification and deadlock avoidance.
   - Wait-For Graph (WFG) & Resource Allocation Graph (RAG) cycle detection via DFS.
   - Deadlock Recovery via victim process termination and resource preemption.

7. **Module 7 — Memory & Virtual Memory**:
   - Contiguous Allocation (First Fit, Best Fit, Worst Fit) with internal & external fragmentation metrics.
   - Paging address translation & Page Tables.
   - Demand Paging Page Replacement: FIFO, LRU, Optimal, LFU.
   - Belady's Anomaly demonstration (`1,2,3,4,1,2,5,1,2,3,4,5` for frames=3 vs 4).
   - Thrashing detection.

8. **Module 8 & 9 — File System & Disk Scheduling**:
   - File allocation simulation (Contiguous, Linked, Indexed i-node).
   - Disk Scheduling algorithms: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK with head trajectory charts.

9. **Module 10 & 11 — Lab Resource Management & Allocation**:
   - Workstations (PC-01 to PC-05), Software Licenses (MATLAB, ANSYS, Cadence, LabVIEW).
   - Real allocation pipeline: Validation ➜ Availability Check ➜ Banker's Safety Check ➜ Memory Best Fit ➜ Grant.

10. **Module 12 — Adaptive Resource Intelligence Engine (Main Innovation)**:
    - Deterministic rule-based decision engine analyzing CPU, Memory, Disk, Queue, Starvation, and Deadlock risk.
    - Produces explainable decision logs with recommended algorithms and automated actions taken.

11. **Module 13 — Integrated Smart-LIMS Laboratory Simulation**:
    - End-to-end execution of a lab job across all 10 OS subsystems.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts
- **Backend**: Node.js, Express, TypeScript, SQLite (`better-sqlite3`), Vitest
- **Scripts**: Linux Bash Shell Scripts (`scripts/*.sh`)

---

## 🚀 Quick Start Instructions

### 1. Installation
Install dependencies for both backend and frontend:
```bash
npm run install:all
```

### 2. Run Automated Test Suite
Execute the Vitest test suite covering all OS algorithms:
```bash
npm test
```

### 3. Build Project
Build both backend (TypeScript compilation) and frontend (Vite production bundle):
```bash
npm run build
```

### 4. Start Development Servers
Start backend (port 5000) and frontend (port 5173):
- **Backend**:
  ```bash
  npm run dev:backend
  ```
- **Frontend** (in another terminal tab):
  ```bash
  npm run dev:frontend
  ```
Open `http://localhost:5173` in your browser.

---

## ⚡ Vercel Services Deployment

SMART-LIMS is configured for deployment using **Vercel Services** via a root-level `vercel.json`.

### Public Routing Architecture:
- `/*` ➜ `frontend` (Vite SPA)
- `/api/*` ➜ `backend` (Express Engine)

### Deploy via Vercel CLI:
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy to Vercel Services
vercel
```

---

## ⚠️ Cloud & Serverless Infrastructure Limitations

### 1. Database Persistence Limitations (SQLite / `better-sqlite3`)
- SMART-LIMS uses `better-sqlite3` as an embedded SQLite database engine.
- On local environments, SQLite writes persistently to `./database/smart_lims.db`.
- On Vercel Serverless Functions, the filesystem is read-only except for ephemeral `/tmp`. In cloud production, SQLite automatically initializes in `/tmp/smart_lims.db`.
- **Note**: Data stored in serverless `/tmp` is ephemeral and resets upon cold starts or new deployments.

### 2. OS Shell Monitoring Scripts Limitations
- The Linux shell scripts in `scripts/` (`cpu_monitoring.sh`, `memory_monitoring.sh`, `disk_monitoring.sh`, etc.) execute local host diagnostics.
- In cloud serverless environments (Vercel), these shell scripts function as **educational OS concept simulations** rather than physical serverless container monitoring.
- All core OS algorithms (CPU scheduling, deadlock avoidance, memory paging, disk scheduling) run in pure TypeScript backend engines and are unaffected by cloud hosting.


```
smart-lims/
├── backend/
│   ├── src/
│   │   ├── core/           # Pure TS OS Engine (Process, CPU, Thread, Sync, Deadlock, Memory, File, Disk, Resource, Adaptive, Sim)
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── database/       # SQLite database configuration
│   │   └── server.ts
│   ├── tsconfig.json
│   └── vitest.config.ts
├── frontend/
│   ├── src/
│   │   ├── components/     # UI Navbar, Sidebar, GanttChart, ScenarioRunner
│   │   ├── pages/          # 12 Interactive OS Module Pages
│   │   ├── services/       # REST API Client
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── vite.config.ts
├── database/               # SQLite DB storage directory
├── scripts/                # Safe Linux bash monitoring scripts
├── tests/                  # Vitest algorithm test suites
├── docs/                   # System documentation (ARCHITECTURE, OS-MAPPING, API, DEMO)
└── package.json
```
