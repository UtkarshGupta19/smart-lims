# Smart-LIMS: College Operating Systems PBL Prototype
### Laboratory Information Management System with Interactive Operating Systems Simulation Engine

Smart-LIMS is an educational Problem-Based Learning (PBL) prototype designed for undergraduate and graduate Operating Systems curriculum evaluation. It models a university computer laboratory as an operating system environment where student and faculty jobs are treated as simulated processes, lab workstations and software licenses act as hardware/software resources, and core OS abstractions govern process execution, CPU scheduling, concurrency synchronization, deadlock avoidance, dynamic memory allocation, and disk operations.

> **Important Educational Distinction:**  
> All simulated CPU scheduling, memory partitions, disk cylinder trajectories, Banker's matrices, and concurrency locks are calculated deterministically by pure TypeScript simulation engines. They are clearly distinguished from actual host operating-system operations (which are accessed solely via safe, read-only whitelisted diagnostic scripts in `scripts/`).

---

## 🏛️ Application Architecture & Modules

```
smart-lims/
├── backend/
│   ├── src/
│   │   ├── core/
│   │   │   ├── cpu/           # 8 Scheduling algorithms with preemption, aging, IDLE intervals & Gantt chart
│   │   │   ├── process/       # Process Control Block (PCB) lifecycle & discrete simulation stepper
│   │   │   ├── sync/          # Workstation booking race condition vs Mutex lock & Classical IPC
│   │   │   ├── deadlock/      # Coffman conditions, Banker's resource-request validator & WFG recovery
│   │   │   ├── memory/        # Dynamic variable-partition allocator (First/Best/Worst Fit) & coalescing
│   │   │   ├── disk/          # FCFS, SSTF, SCAN, C-SCAN with boundary assumptions & comparison
│   │   │   ├── resource/      # Shared ResourceManager enforcing double-booking prevention & audit logs
│   │   │   ├── adaptive/      # Rule-based bottleneck detector & algorithm advisor
│   │   │   └── thread/        # Multithreading mapping models (ULT to KLT) & background workers
│   │   ├── database/          # SQLite schema, tables, audit logger, and persistence fallback
│   │   ├── routes/api.ts      # REST API endpoints with real-time dynamic metric calculations
│   │   └── server.ts          # Express application entry point (Port 5001)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Restrained university-lab Navbar, Sidebar, GanttChart, ScenarioRunner
│   │   ├── pages/             # Modules: Overview, Resources, Processes, Concurrency, Deadlock, Memory, Disk, Logs, Docs
│   │   ├── services/api.ts    # REST API client
│   │   ├── index.css          # Restrained academic styling (light neutral background, slate borders, blue accent)
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── database/                  # Persistent SQLite database storage
├── scripts/                   # Safe, whitelisted, read-only Linux bash scripts (CPU, Memory, Disk, Backup)
└── tests/                     # 8 Vitest test suites (42 automated tests covering all OS algorithms)
```

---

## 📋 Module Mapping to Operating Systems Concepts

| Lab Subsystem | Simulated OS Concept | Implementation Details |
|---|---|---|
| **A. Overview & Diagnostics** | Kernel Metrics & Ready Queue | Real-time calculation of CPU utilization, RAM usage, active processes, and ready queue length derived directly from actual state (no hardcoded metrics). |
| **B. Workstations & Licenses** | Resource Allocation & Protection | Shared `ResourceManager` preventing double-booking of workstations and license over-allocation with persistent audit logs. |
| **C. Process & PCB Management** | Process Control Block (PCB) | PCB with PID, arrival time, burst time, priority, role, and valid state transitions (`NEW` ➜ `READY` ➜ `RUNNING` ➜ `WAITING` ➜ `TERMINATED`) with discrete single-step simulation. |
| **D. CPU Scheduling Lab** | CPU Scheduling Algorithms | Round Robin (configurable quantum), Preemptive Priority with Aging (starvation mitigation), SJF, SRTF, MLQ (System/Faculty/Student queues), and MLFQ with queue demotion/promotion. Includes Gantt charts with explicit `IDLE` blocks. |
| **E. Concurrency & Mutex** | Race Conditions & Mutual Exclusion | Demonstrates lost updates and double-booking bugs under un-synchronized concurrent requests vs atomic Mutex lock serialization. Includes Bounded Buffer (Producer-Consumer) and Peterson's Algorithm. |
| **F. Deadlock Management** | Deadlock Avoidance & Banker's Alg | Displays the 4 Coffman conditions in lab context, Allocation/Max/Need matrices, Banker's safe-sequence evaluator, and tentative request validation (`Request <= Need`, `Request <= Available`). |
| **G. Memory Management** | Contiguous Dynamic Allocation | Variable-partition simulator supporting First Fit, Best Fit, and Worst Fit allocation strategies, visual continuous memory map, external fragmentation metrics, and automatic adjacent block coalescing upon deallocation. |
| **H. Disk Scheduling** | Disk Arm Scheduling | FCFS, SSTF, SCAN (Elevator), and C-SCAN algorithms with explicit boundary explanations, cylinder range input validation, and comparative total head travel calculations. |
| **I. Automation & Audit Logs** | Shell Diagnostics & Security Audit | Whitelisted read-only diagnostic scripts for host CPU, RAM, disk, and backup verification without arbitrary shell command execution. Persistent audit logs in SQLite. |

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Install Dependencies
```bash
# Install root, backend, and frontend packages
npm run install:all
```

### 2. Environment Variables
Create `.env` in the `backend/` directory if custom ports are desired (defaults to port 5001):
```env
PORT=5001
NODE_ENV=development
```

### 3. Run Automated OS Algorithm Tests
Execute the comprehensive Vitest test suite covering scheduling, arrival times, preemption, aging, Banker's requests, dynamic memory coalescing, disk arm calculations, and SQLite persistence:
```bash
npm test
```
*Expected Result: 8 test files, 42 tests passing.*

### 4. Build for Production
Build both backend TypeScript code and frontend Vite bundle:
```bash
npm run build
```

### 5. Start Development Servers
Run backend and frontend concurrently:
```bash
# Start backend on http://localhost:5001
npm run dev:backend

# In a separate terminal, start frontend on http://localhost:5173
npm run dev:frontend
```
Open **`http://localhost:5173`** in your browser.

---

## 🎯 Guided Demonstration Mode (6 Reproducible Scenarios)

The application includes an interactive **OS PBL Demonstration Runner** accessible at the top of the Overview and Process pages:

### Scenario 1: Round Robin Scheduling
- **OS Concept:** Time-sliced preemption preventing CPU hogging by long batch jobs.
- **Inputs:** 4 Jobs with staggered arrivals (bursts 5, 4, 2, 6; time quantum = 2s).
- **Execution:** Click **"Execute Scenario"**.
- **Results:**
  - Gantt chart displays interleaved time slices (`P1` ➜ `P2` ➜ `P3` ➜ `P1` ...).
  - Average Waiting Time: `6.00s`, Average Turnaround Time: `10.25s`.
  - Detailed step-by-step decision log showing ready queue state at each context switch.

### Scenario 2: Priority Preemption & Aging
- **OS Concept:** Higher priority urgent jobs immediately preempt lower priority jobs; aging boosts starved low-priority jobs.
- **Inputs:** Low-priority batch job running when urgent faculty job arrives at `t=2`.
- **Execution:** Click **"Execute Scenario"**.
- **Results:**
  - Higher-priority job immediately preempts running job at `t=2`.
  - Starvation mitigation engine logs priority increments for waiting jobs.

### Scenario 3: Workstation Booking Race Condition vs Mutex
- **OS Concept:** Concurrency hazards (lost updates, double allocation) occurring without critical section mutual exclusion.
- **Inputs:** Two competing student requests attempting to reserve `Workstation PC-01` simultaneously.
- **Execution:** Click **"Execute Scenario"**.
- **Results:**
  - **Without Lock (Unsynchronized):** Interleaved execution causes Thread 2 to overwrite Thread 1's reservation, creating a double-booking bug.
  - **With Mutex Lock:** Thread 1 acquires lock; Thread 2 is blocked in the waiting queue. When Thread 2 enters, atomic check detects the workstation is occupied and safely rejects the duplicate request.

### Scenario 4: Banker's Deadlock Avoidance
- **OS Concept:** Safe-state verification before granting eligible resource requests.
- **Inputs:** 3 processes, 2 resource types (`R1`, `R2`).
- **Execution:** Click **"Execute Scenario"**.
- **Results:**
  - Need matrix evaluated (`Max - Allocation`).
  - Banker's safety algorithm finds safe execution sequence (`P1 ➜ P0 ➜ P2`).
  - Interactive form allows testing unsafe requests, correctly triggering rejection/wait states.

### Scenario 5: Dynamic Memory Allocation & Coalescing
- **OS Concept:** Variable-partition allocation strategies, external fragmentation, and hole merging.
- **Inputs:** 1024 MB physical memory space.
- **Execution:** Click **"Execute Scenario"**.
- **Results:**
  - Compares First Fit, Best Fit, and Worst Fit placements.
  - Deallocation of adjacent blocks automatically merges free partitions, updating the visual continuous memory map.

### Scenario 6: Disk Arm Scheduling Comparison
- **OS Concept:** Minimizing mechanical head movement and seek latency across cylinder requests.
- **Inputs:** Request queue `[98, 183, 37, 122, 14, 124, 65, 67]`, Initial head `53`, Disk size `200`.
- **Execution:** Click **"Execute Scenario"**.
- **Results:**
  - Side-by-side benchmark table comparing FCFS (`640` cylinders), SSTF (`236` cylinders), SCAN (`331` cylinders), and C-SCAN (`382` cylinders).
  - Explicit explanation of boundary reversal and sweep assumptions.

---

## 🔒 Security & Data Integrity

- **No Arbitrary Shell Execution:** The system uses strict argument whitelisting for diagnostic scripts. Arbitrary user command input is completely prohibited.
- **Database Fallback:** Uses embedded SQLite (`better-sqlite3`) with automatic table creation and memory-safe fallbacks for serverless environments.
- **Input Validation:** All REST API endpoints validate payload bounds using strict type checking before passing requests to core calculation engines.
- **Double Booking Prevention:** The shared `ResourceManager` performs synchronous status and memory capacity checks before committing allocations to the database.

---

## 📜 Academic Project Evaluation Checklist

- [x] Clear distinction between pure JavaScript educational simulation and host OS operations.
- [x] Restrained, professional university-lab user interface (white/neutral background, dark text, subtle borders, blue accent, no excessive neon/emojis).
- [x] Process Control Block (PCB) state machine with discrete simulation stepping.
- [x] 8 CPU scheduling algorithms with IDLE interval handling, Gantt charts, and per-step ready queue tracking.
- [x] Workstation booking race condition simulation with Mutex lock comparison.
- [x] Banker's algorithm safe sequence evaluator and tentative request validation.
- [x] Dynamic variable-partition memory allocator with coalescing and external fragmentation metrics.
- [x] Disk scheduling (FCFS, SSTF, SCAN, C-SCAN) with boundary assumptions and trajectory comparison.
- [x] 6 reproducible demonstration scenarios with interactive runs and state restoration.
- [x] 8 automated Vitest test suites (42 unit/integration tests) passing with 100% success rate.
