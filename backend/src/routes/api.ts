import { Router, Request, Response } from 'express';
import { processManager } from '../core/process/ProcessManager.js';
import { cpuScheduler } from '../core/cpu/CPUScheduler.js';
import { threadEngine } from '../core/thread/ThreadEngine.js';
import { synchronizationEngine } from '../core/sync/SynchronizationEngine.js';
import { deadlockEngine } from '../core/deadlock/DeadlockEngine.js';
import { memoryManager } from '../core/memory/MemoryManager.js';
import { fileManager } from '../core/file/FileManager.js';
import { diskScheduler } from '../core/disk/DiskScheduler.js';
import { resourceManager } from '../core/resource/ResourceManager.js';
import { adaptiveEngine } from '../core/adaptive/AdaptiveEngine.js';
import { simulationEngine } from '../core/simulation/SimulationEngine.js';
import { exec } from 'child_process';
import path from 'path';

export const apiRouter = Router();

// ==========================================
// 0. API ROOT & HEALTH
// ==========================================
apiRouter.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    name: 'SMART-LIMS',
    description: 'Adaptive OS-Based Laboratory Resource Management System',
    status: 'running',
    version: '1.0.0',
    modules: [
      'process-management',
      'cpu-scheduling',
      'threads',
      'concurrency',
      'deadlock',
      'memory-management',
      'file-management',
      'disk-scheduling',
      'resource-management',
      'adaptive-intelligence',
      'integrated-simulation',
    ],
  });
});

apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    healthy: true,
    timestamp: new Date().toISOString(),
    system: 'SMART-LIMS OS Engine',
  });
});

// ==========================================
// 1. SYSTEM METRICS & SHELL MONITORING
// ==========================================
apiRouter.get('/system/metrics', (req: Request, res: Response) => {
  res.json({
    cpuUtilization: 42.5,
    memoryUtilization: 58.2,
    diskUtilization: 34.0,
    activeProcesses: processManager.getAllProcesses().length,
    readyQueueLength: processManager.getAllProcesses().filter(p => p.state === 'READY').length,
    waitingProcesses: processManager.getAllProcesses().filter(p => p.state === 'WAITING').length,
    availableMachines: resourceManager.getMachines().filter(m => m.isAvailable).length,
    availableLicenses: resourceManager.getLicenses().reduce((sum, l) => sum + l.availableLicenses, 0),
    deadlockStatus: 'SAFE',
    memoryPressure: 'LOW',
    diskPressure: 'NORMAL',
    currentBottleneck: 'NONE',
  });
});

// Safe Linux Script Monitoring API
apiRouter.get('/system/monitor/:script', (req: Request, res: Response) => {
  const allowedScripts = [
    'user_management.sh',
    'file_management.sh',
    'process_monitoring.sh',
    'cpu_monitoring.sh',
    'memory_monitoring.sh',
    'disk_monitoring.sh',
    'backup.sh',
    'health_check.sh',
  ];

  const scriptName = req.params.script;
  if (!allowedScripts.includes(scriptName)) {
    return res.status(400).json({ error: 'Invalid or unauthorized monitoring script request' });
  }

  const scriptPath = path.resolve(process.cwd(), '../scripts', scriptName);
  exec(`"${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message, stderr });
    }
    res.json({ script: scriptName, output: stdout });
  });
});

// Modern OS Concepts (VM / Hypervisor / GPU CUDA conceptual simulation)
apiRouter.get('/system/modern-concepts', (req: Request, res: Response) => {
  res.json({
    virtualMachine: {
      hypervisorType: 'Type-1 (Bare Metal / KVM Simulated)',
      virtualCpus: 8,
      allocatedRamGB: 16,
      guestOs: 'Ubuntu 24.04 LTS (Smart-LIMS Guest)',
      status: 'RUNNING',
    },
    gpuAcceleration: {
      gpuModel: 'NVIDIA RTX 4090 (Simulated CUDA Core Engine)',
      cudaCores: 16384,
      vramGB: 24,
      cudaVersion: '12.4',
      activeCudaStreams: 4,
      gpuUtilizationPercent: 78,
    },
  });
});

// ==========================================
// 2. PROCESS MANAGEMENT APIs
// ==========================================
apiRouter.get('/processes', (req: Request, res: Response) => {
  res.json(processManager.getAllProcesses());
});

apiRouter.post('/processes', (req: Request, res: Response) => {
  const pcb = processManager.createProcess(req.body);
  res.status(201).json(pcb);
});

apiRouter.put('/processes/:pid/state', (req: Request, res: Response) => {
  try {
    const updated = processManager.updateState(req.params.pid, req.body.state);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 3. CPU SCHEDULING APIs
// ==========================================
apiRouter.post('/scheduling/run', (req: Request, res: Response) => {
  const { algorithm, processes, quantum, applyAging } = req.body;
  const inputProcs = processes || processManager.getAllProcesses();

  let result;
  switch (algorithm) {
    case 'FCFS':
      result = cpuScheduler.fcfs(inputProcs);
      break;
    case 'SJF':
      result = cpuScheduler.sjfNonPreemptive(inputProcs);
      break;
    case 'SRTF':
      result = cpuScheduler.srtf(inputProcs);
      break;
    case 'PRIORITY_NP':
      result = cpuScheduler.priorityNonPreemptive(inputProcs);
      break;
    case 'PRIORITY_P':
      result = cpuScheduler.priorityPreemptive(inputProcs);
      break;
    case 'ROUND_ROBIN':
      result = cpuScheduler.roundRobin(inputProcs, quantum || 2, applyAging);
      break;
    case 'MLQ':
      result = cpuScheduler.multilevelQueue(inputProcs);
      break;
    case 'MLFQ':
      result = cpuScheduler.multilevelFeedbackQueue(inputProcs);
      break;
    default:
      return res.status(400).json({ error: 'Unknown CPU scheduling algorithm specified' });
  }

  res.json(result);
});

// ==========================================
// 4. THREAD MANAGEMENT APIs
// ==========================================
apiRouter.get('/threads', (req: Request, res: Response) => {
  res.json({
    threads: threadEngine.getThreads(),
    backgroundWorkers: threadEngine.getBackgroundWorkers(),
  });
});

apiRouter.post('/threads/model-mapping', (req: Request, res: Response) => {
  const { model, userThreads, kernelThreads } = req.body;
  const result = threadEngine.simulateModelMapping(model || 'MANY_TO_MANY', userThreads || 4, kernelThreads || 2);
  res.json(result);
});

// ==========================================
// 5. CONCURRENCY & SYNCHRONIZATION APIs
// ==========================================
apiRouter.post('/synchronization/race-condition', (req: Request, res: Response) => {
  const { initialBalance, iterations } = req.body;
  const result = synchronizationEngine.runRaceConditionSimulation(initialBalance, iterations);
  res.json(result);
});

apiRouter.post('/synchronization/critical-section', (req: Request, res: Response) => {
  const { algorithm } = req.body;
  const result = synchronizationEngine.runCriticalSectionAlgo(algorithm || 'PETERSON');
  res.json(result);
});

apiRouter.post('/synchronization/bounded-buffer', (req: Request, res: Response) => {
  const { capacity, steps } = req.body;
  const result = synchronizationEngine.runBoundedBuffer(capacity, steps);
  res.json(result);
});

apiRouter.post('/synchronization/dining-philosophers', (req: Request, res: Response) => {
  const result = synchronizationEngine.runDiningPhilosophers();
  res.json(result);
});

apiRouter.post('/synchronization/readers-writers', (req: Request, res: Response) => {
  const result = synchronizationEngine.runReadersWriters();
  res.json(result);
});

apiRouter.post('/synchronization/sleeping-barber', (req: Request, res: Response) => {
  const { chairs } = req.body;
  const result = synchronizationEngine.runSleepingBarber(chairs);
  res.json(result);
});

// ==========================================
// 6. DEADLOCK ENGINE APIs
// ==========================================
apiRouter.post('/deadlock/banker', (req: Request, res: Response) => {
  const defaultMatrix = {
    processes: ['P1', 'P2', 'P3', 'P4'],
    resources: ['PC-01', 'MATLAB', 'ANSYS'],
    available: [3, 3, 2],
    max: [
      [7, 5, 3],
      [3, 2, 2],
      [9, 0, 2],
      [2, 2, 2],
    ],
    allocation: [
      [0, 1, 0],
      [2, 0, 0],
      [3, 0, 2],
      [2, 1, 1],
    ],
    need: [],
  };

  const matrix = req.body.matrix || defaultMatrix;
  const result = deadlockEngine.runBankersAlgorithm(matrix);
  res.json(result);
});

apiRouter.post('/deadlock/detect', (req: Request, res: Response) => {
  const matrix = req.body.matrix || {
    processes: ['P1', 'P2'],
    resources: ['PC-01', 'MATLAB'],
    available: [0, 0],
    max: [
      [1, 1],
      [1, 1],
    ],
    allocation: [
      [1, 0],
      [0, 1],
    ],
    need: [
      [0, 1],
      [1, 0],
    ],
  };

  const result = deadlockEngine.detectDeadlock(matrix);
  res.json(result);
});

apiRouter.post('/deadlock/recover', (req: Request, res: Response) => {
  const matrix = req.body.matrix;
  const result = deadlockEngine.recoverFromDeadlock(matrix);
  res.json(result);
});

// ==========================================
// 7. MEMORY MANAGEMENT APIs
// ==========================================
apiRouter.post('/memory/allocate', (req: Request, res: Response) => {
  const { partitions, requests, algorithm } = req.body;
  const defaultPartitions = [
    { id: 1, size: 100 },
    { id: 2, size: 500 },
    { id: 3, size: 200 },
    { id: 4, size: 300 },
    { id: 5, size: 600 },
  ];
  const defaultRequests = [
    { pid: 'P1', size: 212 },
    { pid: 'P2', size: 417 },
    { pid: 'P3', size: 112 },
    { pid: 'P4', size: 426 },
  ];

  const result = memoryManager.allocateContiguousPartitions(
    partitions || defaultPartitions,
    requests || defaultRequests,
    algorithm || 'FIRST_FIT'
  );
  res.json(result);
});

apiRouter.post('/memory/page-replacement', (req: Request, res: Response) => {
  const { referenceString, frameCount, algorithm } = req.body;
  const defaultRef = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1];
  const result = memoryManager.runPageReplacement(
    referenceString || defaultRef,
    frameCount || 3,
    algorithm || 'FIFO'
  );
  res.json(result);
});

apiRouter.get('/memory/belady', (req: Request, res: Response) => {
  const result = memoryManager.runBeladyAnomaly();
  res.json(result);
});

// ==========================================
// 8. FILE MANAGEMENT APIs
// ==========================================
apiRouter.get('/file/system', (req: Request, res: Response) => {
  res.json(fileManager.getFileSystemState());
});

apiRouter.post('/file/allocate', (req: Request, res: Response) => {
  const { filename, sizeBlocks, allocationMethod } = req.body;
  const result = fileManager.allocateFile(filename, sizeBlocks, allocationMethod);
  res.json(result);
});

// ==========================================
// 9. DISK SCHEDULING APIs
// ==========================================
apiRouter.post('/disk/schedule', (req: Request, res: Response) => {
  const { queue, initialHead, algorithm, direction, diskSize } = req.body;
  const reqQueue = queue || [98, 183, 37, 122, 14, 124, 65, 67];
  const head = initialHead ?? 53;

  let result;
  switch (algorithm) {
    case 'FCFS':
      result = diskScheduler.fcfs(reqQueue, head);
      break;
    case 'SSTF':
      result = diskScheduler.sstf(reqQueue, head);
      break;
    case 'SCAN':
      result = diskScheduler.scan(reqQueue, head, diskSize || 200, direction || 'RIGHT');
      break;
    case 'C-SCAN':
      result = diskScheduler.cscan(reqQueue, head, diskSize || 200);
      break;
    case 'LOOK':
      result = diskScheduler.look(reqQueue, head, direction || 'RIGHT');
      break;
    case 'C-LOOK':
      result = diskScheduler.clook(reqQueue, head);
      break;
    default:
      result = diskScheduler.sstf(reqQueue, head);
  }

  res.json(result);
});

// ==========================================
// 10. LAB RESOURCES APIs
// ==========================================
apiRouter.get('/resources/machines', (req: Request, res: Response) => {
  res.json(resourceManager.getMachines());
});

apiRouter.get('/resources/licenses', (req: Request, res: Response) => {
  res.json(resourceManager.getLicenses());
});

apiRouter.post('/resources/request', (req: Request, res: Response) => {
  const result = resourceManager.allocateResource(req.body);
  res.json(result);
});

// ==========================================
// 11. ADAPTIVE INTELLIGENCE ENGINE APIs
// ==========================================
apiRouter.get('/adaptive/history', (req: Request, res: Response) => {
  res.json(adaptiveEngine.getHistory());
});

apiRouter.post('/adaptive/evaluate', (req: Request, res: Response) => {
  const decision = adaptiveEngine.analyzeAndDecide(req.body);
  res.json(decision);
});

// ==========================================
// 12. INTEGRATED SIMULATION API
// ==========================================
apiRouter.post('/simulation/run', (req: Request, res: Response) => {
  const result = simulationEngine.runIntegratedSimulation(req.body);
  res.json(result);
});

// ==========================================
// 13. PRESET DEMO SCENARIOS (A to J)
// ==========================================
apiRouter.post('/scenarios/run/:scenarioId', (req: Request, res: Response) => {
  const { scenarioId } = req.params;

  let result;
  switch (scenarioId.toUpperCase()) {
    case 'A': // Normal student lab
      result = simulationEngine.runIntegratedSimulation({ jobName: 'Scenario A: Web Dev Lab', role: 'Student', burstTime: 4, priority: 3, memoryReqMB: 128 });
      break;
    case 'B': // Heavy CPU workload
      result = cpuScheduler.multilevelFeedbackQueue([
        { pid: 'P1', name: 'AI Matrix Mult', role: 'Student', arrivalTime: 0, burstTime: 18, remainingTime: 18, priority: 3, state: 'NEW', memoryReq: 512, diskReq: 20, requiredMachines: [], requiredLicenses: [], creationTime: Date.now() },
        { pid: 'P2', name: 'Compilation Job', role: 'Student', arrivalTime: 1, burstTime: 12, remainingTime: 12, priority: 2, state: 'NEW', memoryReq: 256, diskReq: 10, requiredMachines: [], requiredLicenses: [], creationTime: Date.now() },
      ]);
      break;
    case 'C': // Memory Pressure & Thrashing
      result = memoryManager.runPageReplacement([1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5, 6, 7, 1, 2], 3, 'FIFO');
      break;
    case 'D': // Heavy Disk Workload
      result = diskScheduler.cscan([14, 37, 65, 67, 98, 122, 124, 183, 190, 5], 53);
      break;
    case 'E': // Exam Workload (Strict priority)
      result = cpuScheduler.priorityPreemptive([
        { pid: 'P-EXAM-1', name: 'Exam Auto-Grader', role: 'Faculty', arrivalTime: 0, burstTime: 5, remainingTime: 5, priority: 1, state: 'NEW', memoryReq: 256, diskReq: 5, requiredMachines: [], requiredLicenses: [], creationTime: Date.now() },
        { pid: 'P-STUDENT-1', name: 'Student Code Run', role: 'Student', arrivalTime: 0, burstTime: 8, remainingTime: 8, priority: 5, state: 'NEW', memoryReq: 128, diskReq: 5, requiredMachines: [], requiredLicenses: [], creationTime: Date.now() },
      ]);
      break;
    case 'F': // License Contention
      result = resourceManager.allocateResource({ pid: 'P-License-Test', licenseId: 'LIC-CADENCE', licenseCount: 1 });
      break;
    case 'G': // Race Condition
      result = synchronizationEngine.runRaceConditionSimulation(100, 5);
      break;
    case 'H': // Deadlock scenario
      result = deadlockEngine.detectDeadlock({
        processes: ['P1', 'P2'],
        resources: ['PC-01', 'MATLAB'],
        available: [0, 0],
        max: [[1, 1], [1, 1]],
        allocation: [[1, 0], [0, 1]],
        need: [[0, 1], [1, 0]],
      });
      break;
    case 'I': // Starvation scenario
      result = cpuScheduler.roundRobin([
        { pid: 'P-HIGH-1', name: 'High Priority Job 1', role: 'Faculty', arrivalTime: 0, burstTime: 10, remainingTime: 10, priority: 1, state: 'NEW', memoryReq: 128, diskReq: 5, requiredMachines: [], requiredLicenses: [], creationTime: Date.now() },
        { pid: 'P-STARVE', name: 'Starving Low Priority Job', role: 'Student', arrivalTime: 0, burstTime: 4, remainingTime: 4, priority: 10, state: 'NEW', memoryReq: 128, diskReq: 5, requiredMachines: [], requiredLicenses: [], creationTime: Date.now() },
      ], 2, true);
      break;
    case 'J': // Complete mixed workload
      result = simulationEngine.runIntegratedSimulation({ jobName: 'Scenario J: Full Mixed Lab Load', role: 'Faculty', burstTime: 10, priority: 1, memoryReqMB: 512, licenseRequested: 'LIC-ANSYS', targetMachine: 'PC-03' });
      break;
    default:
      result = simulationEngine.runIntegratedSimulation({ jobName: 'Default Scenario', role: 'Student', burstTime: 5, priority: 3, memoryReqMB: 256 });
  }

  res.json({ scenarioId, result });
});
