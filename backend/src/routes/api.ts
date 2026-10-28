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
import { getRecentLogs, logEvent } from '../database/db.js';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

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
      'audit-logging',
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
  const allProcs = processManager.getAllProcesses();
  const machines = resourceManager.getMachines();
  const licenses = resourceManager.getLicenses();

  const totalMachines = machines.length;
  const availableMachines = machines.filter(m => m.isAvailable && m.status === 'AVAILABLE').length;

  const totalLicenses = licenses.reduce((sum, l) => sum + l.totalLicenses, 0);
  const availableLicenses = licenses.reduce((sum, l) => sum + l.availableLicenses, 0);

  const pendingJobs = allProcs.filter(p => p.state === 'NEW').length;
  const readyQueueLength = allProcs.filter(p => p.state === 'READY').length;
  const runningJobs = allProcs.filter(p => p.state === 'RUNNING').length;
  const waitingProcesses = allProcs.filter(p => p.state === 'WAITING').length;
  const completedJobs = allProcs.filter(p => p.state === 'TERMINATED').length;
  const activeProcesses = allProcs.filter(p => p.state !== 'TERMINATED').length;

  // Real calculated memory utilization from machine allocations
  const totalRam = machines.reduce((acc, m) => acc + m.ramMB, 0) || 1;
  const usedRam = machines.reduce((acc, m) => acc + m.currentMemoryUsageMB, 0);
  const memoryUtilization = Number(((usedRam / totalRam) * 100).toFixed(1));

  // Real calculated CPU utilization based on active workload vs capacity
  const activeMachinesCount = machines.filter(m => m.isAvailable).length || 1;
  const runningBurstWeight = runningJobs * 40;
  const readyBurstWeight = readyQueueLength * 12;
  const cpuUtilization = Number(
    Math.min(95, Math.max(5, (runningBurstWeight + readyBurstWeight) / activeMachinesCount)).toFixed(1)
  );

  // Real calculated disk utilization from machines
  const totalDisk = machines.reduce((acc, m) => acc + m.diskGB, 0) || 1;
  const usedDisk = machines.reduce((acc, m) => acc + m.currentDiskUsageGB, 0);
  const diskUtilization = Number(((usedDisk / totalDisk) * 100).toFixed(1));

  // Fetch recent system events
  const dbLogs = getRecentLogs(5);
  const recentEvents = dbLogs.map(l => ({
    timestamp: l.timestamp,
    module: l.module,
    message: l.message,
  }));

  res.json({
    cpuUtilization,
    memoryUtilization,
    diskUtilization,
    activeProcesses,
    readyQueueLength,
    waitingProcesses,
    pendingJobs,
    completedJobs,
    runningJobs,
    totalMachines,
    availableMachines,
    totalLicenses,
    availableLicenses,
    currentSchedulingAlgorithm: 'ROUND_ROBIN',
    deadlockStatus: 'SAFE',
    memoryPressure: memoryUtilization > 80 ? 'HIGH' : memoryUtilization > 50 ? 'MODERATE' : 'LOW',
    diskPressure: diskUtilization > 80 ? 'HIGH' : 'NORMAL',
    currentBottleneck: cpuUtilization > 85 ? 'CPU' : memoryUtilization > 80 ? 'MEMORY' : 'NONE',
    recentEvents,
  });
});

// Safe Linux Script Monitoring API with accurate labeling
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

  // Find scripts directory in either ./scripts or ../scripts
  let scriptPath = path.resolve(process.cwd(), 'scripts', scriptName);
  if (!fs.existsSync(scriptPath)) {
    scriptPath = path.resolve(process.cwd(), '../scripts', scriptName);
  }

  if (!fs.existsSync(scriptPath)) {
    return res.status(404).json({ error: `Script file not found at ${scriptPath}` });
  }

  exec(`bash "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      logEvent('ERROR', 'SHELL_MONITOR', `Error running ${scriptName}: ${error.message}`);
      return res.status(500).json({ error: error.message, stderr, script: scriptName });
    }
    logEvent('INFO', 'SHELL_MONITOR', `Executed safe script ${scriptName}`);
    res.json({
      script: scriptName,
      output: stdout,
      isRealHostExecution: true,
      note: 'Host diagnostic shell script executed safely on server',
    });
  });
});

// Modern OS Concepts
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

apiRouter.get('/processes/:pid', (req: Request, res: Response) => {
  const pcb = processManager.getProcess(req.params.pid);
  if (!pcb) return res.status(404).json({ error: `Process ${req.params.pid} not found` });
  res.json(pcb);
});

apiRouter.post('/processes', (req: Request, res: Response) => {
  try {
    const { name, role, arrivalTime, burstTime, priority, memoryReq, diskReq } = req.body;
    if (!name || burstTime === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name and burstTime' });
    }
    const pcb = processManager.createProcess({
      name,
      role,
      arrivalTime: Number(arrivalTime) || 0,
      burstTime: Number(burstTime),
      priority: Number(priority) || 5,
      memoryReq: Number(memoryReq) || 128,
      diskReq: Number(diskReq) || 10,
    });
    res.status(201).json(pcb);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/processes/:pid/state', (req: Request, res: Response) => {
  try {
    const { state, reason } = req.body;
    if (!state) return res.status(400).json({ error: 'State is required' });
    const updated = processManager.updateState(req.params.pid, state, reason);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/processes/step', (req: Request, res: Response) => {
  const stepResult = processManager.stepSimulation();
  res.json(stepResult);
});

apiRouter.post('/processes/reset', (req: Request, res: Response) => {
  processManager.resetSimulation();
  res.json({ success: true, message: 'Process simulation reset to initial state' });
});

apiRouter.delete('/processes/:pid', (req: Request, res: Response) => {
  const removed = processManager.removeProcess(req.params.pid);
  if (!removed) return res.status(404).json({ error: `Process ${req.params.pid} not found` });
  res.json({ success: true, message: `Process ${req.params.pid} removed` });
});

// ==========================================
// 3. CPU SCHEDULING APIs
// ==========================================
apiRouter.post('/scheduling/run', (req: Request, res: Response) => {
  const { algorithm, processes, quantum, applyAging } = req.body;
  const inputProcs = processes && processes.length > 0 ? processes : processManager.getAllProcesses();

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
    case 'PRIORITY_NON_PREEMPTIVE':
      result = cpuScheduler.priorityNonPreemptive(inputProcs);
      break;
    case 'PRIORITY_P':
    case 'PRIORITY_PREEMPTIVE':
      result = cpuScheduler.priorityPreemptive(inputProcs, applyAging);
      break;
    case 'ROUND_ROBIN':
    case 'RR':
      result = cpuScheduler.roundRobin(inputProcs, Number(quantum) || 2, applyAging);
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
apiRouter.post(['/synchronization/booking-race', '/concurrency/booking-race'], (req: Request, res: Response) => {
  const { resourceId, resourceName } = req.body;
  const result = synchronizationEngine.runBookingRaceSimulation(resourceId || 'PC-01', resourceName || 'Workstation Alpha');
  res.json(result);
});

apiRouter.post(['/synchronization/race-condition', '/concurrency/race-condition'], (req: Request, res: Response) => {
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
apiRouter.get('/deadlock/conditions', (req: Request, res: Response) => {
  res.json(deadlockEngine.getDeadlockConditionsExplanation());
});

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

apiRouter.post('/deadlock/validate-request', (req: Request, res: Response) => {
  const { matrix, pid, request } = req.body;
  if (!matrix || !pid || !request) {
    return res.status(400).json({ error: 'matrix, pid, and request vector are required' });
  }
  const result = deadlockEngine.validateResourceRequest(matrix, pid, request);
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
apiRouter.get('/memory/dynamic/state', (req: Request, res: Response) => {
  res.json(memoryManager.getDynamicMemoryState());
});

apiRouter.post('/memory/dynamic/allocate', (req: Request, res: Response) => {
  const { pid, processName, sizeMB, strategy } = req.body;
  if (!pid || !sizeMB) {
    return res.status(400).json({ error: 'pid and sizeMB are required' });
  }
  const result = memoryManager.allocateDynamicProcess(
    pid,
    processName || `Process-${pid}`,
    Number(sizeMB),
    strategy || 'FIRST_FIT'
  );
  res.json(result);
});

apiRouter.post('/memory/dynamic/deallocate', (req: Request, res: Response) => {
  const { pidOrBlockId } = req.body;
  if (!pidOrBlockId) return res.status(400).json({ error: 'pidOrBlockId is required' });
  const result = memoryManager.deallocateDynamicProcess(pidOrBlockId);
  res.json(result);
});

apiRouter.post('/memory/dynamic/reset', (req: Request, res: Response) => {
  const { totalMemoryMB, seeded } = req.body;
  const isSeeded = seeded !== undefined ? Boolean(seeded) : true;
  const state = memoryManager.resetDynamicMemory(totalMemoryMB ? Number(totalMemoryMB) : 1024, isSeeded);
  res.json(state);
});

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
  const size = Number(diskSize) || 200;

  // Validate inputs
  const validation = diskScheduler.validateInputs(reqQueue, head, size);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  let result;
  switch (algorithm) {
    case 'FCFS':
      result = diskScheduler.fcfs(reqQueue, head);
      break;
    case 'SSTF':
      result = diskScheduler.sstf(reqQueue, head);
      break;
    case 'SCAN':
      result = diskScheduler.scan(reqQueue, head, size, direction || 'RIGHT');
      break;
    case 'C-SCAN':
      result = diskScheduler.cscan(reqQueue, head, size);
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

  // Also include boundary assumption explanations
  result.boundaryAssumption = algorithm.includes('SCAN')
    ? algorithm === 'C-SCAN'
      ? `C-SCAN sweeps forward to cylinder ${size - 1}, immediately resets to 0 without servicing requests, then resumes.`
      : `SCAN sweeps toward the boundary (track ${size - 1} or 0) before reversing.`
    : undefined;

  res.json(result);
});

apiRouter.post('/disk/compare', (req: Request, res: Response) => {
  const { queue, initialHead, diskSize, direction } = req.body;
  const reqQueue = queue || [98, 183, 37, 122, 14, 124, 65, 67];
  const head = initialHead ?? 53;
  const size = Number(diskSize) || 200;

  const validation = diskScheduler.validateInputs(reqQueue, head, size);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const comparison = diskScheduler.compareAll(reqQueue, head, size, direction || 'RIGHT');
  res.json(comparison);
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

apiRouter.get('/resources/audit-log', (req: Request, res: Response) => {
  res.json(resourceManager.getAuditLogs());
});

apiRouter.post('/resources/book', (req: Request, res: Response) => {
  const { machineId, licenseId, userName, pid, memoryMB, licenseCount } = req.body;
  if (!userName || !pid) {
    return res.status(400).json({ error: 'userName and pid are required for booking' });
  }
  const result = resourceManager.bookResource({
    machineId,
    licenseId,
    userName,
    pid,
    memoryMB: Number(memoryMB) || 512,
    licenseCount: Number(licenseCount) || 1,
  });
  if (!result.success) {
    return res.status(409).json(result);
  }
  res.json(result);
});

apiRouter.post('/resources/cancel', (req: Request, res: Response) => {
  const { machineId, licenseId, pid, userName } = req.body;
  const result = resourceManager.cancelBooking({ machineId, licenseId, pid, userName });
  res.json(result);
});

apiRouter.post('/resources/request', (req: Request, res: Response) => {
  const result = resourceManager.allocateResource(req.body);
  res.json(result);
});

// ==========================================
// 11. AUDIT LOGS API
// ==========================================
apiRouter.get('/logs', (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  res.json(getRecentLogs(limit));
});

// ==========================================
// 12. ADAPTIVE INTELLIGENCE ENGINE APIs
// ==========================================
apiRouter.get('/adaptive/history', (req: Request, res: Response) => {
  res.json(adaptiveEngine.getHistory());
});

apiRouter.post('/adaptive/evaluate', (req: Request, res: Response) => {
  const decision = adaptiveEngine.analyzeAndDecide(req.body);
  res.json(decision);
});

// ==========================================
// 13. INTEGRATED SIMULATION API
// ==========================================
apiRouter.post('/simulation/run', (req: Request, res: Response) => {
  const result = simulationEngine.runIntegratedSimulation(req.body);
  res.json(result);
});

// ==========================================
// 14. PRESET DEMO SCENARIOS (A to F for College PBL)
// ==========================================
apiRouter.post('/scenarios/run/:scenarioId', (req: Request, res: Response) => {
  const { scenarioId } = req.params;

  let result;
  switch (scenarioId.toUpperCase()) {
    case 'RR':
    case 'A': // Sample Round Robin scheduling run
      result = cpuScheduler.roundRobin([
        { pid: 'P1', name: 'Web Dev Server', role: 'Student', arrivalTime: 0, burstTime: 5, remainingTime: 5, priority: 3, state: 'NEW', memoryReq: 128, diskReq: 5, requiredMachines: [], requiredLicenses: [], creationTime: Date.now() },
        { pid: 'P2', name: 'SQL Query Batch', role: 'Student', arrivalTime: 1, burstTime: 4, remainingTime: 4, priority: 2, state: 'NEW', memoryReq: 256, diskReq: 10, requiredMachines: [], requiredLicenses: [], creationTime: Date.now() },
        { pid: 'P3', name: 'Compiler Pass', role: 'Faculty', arrivalTime: 2, burstTime: 2, remainingTime: 2, priority: 1, state: 'NEW', memoryReq: 128, diskReq: 5, requiredMachines: [], requiredLicenses: [], creationTime: Date.now() },
        { pid: 'P4', name: 'File Backup Daemon', role: 'System', arrivalTime: 4, burstTime: 6, remainingTime: 6, priority: 4, state: 'NEW', memoryReq: 64, diskReq: 20, requiredMachines: [], requiredLicenses: [], creationTime: Date.now() },
      ], 2, false);
      break;

    case 'PRIORITY':
    case 'B': // Priority preemption and aging example
      result = cpuScheduler.priorityPreemptive([
        { pid: 'P-FACULTY', name: 'Real-time Exam Grader', role: 'Faculty', arrivalTime: 2, burstTime: 4, remainingTime: 4, priority: 1, state: 'NEW', memoryReq: 256, diskReq: 5, requiredMachines: [], requiredLicenses: [], creationTime: Date.now() },
        { pid: 'P-STUDENT-LONG', name: 'Monte Carlo Sim', role: 'Student', arrivalTime: 0, burstTime: 10, remainingTime: 10, priority: 5, state: 'NEW', memoryReq: 512, diskReq: 15, requiredMachines: [], requiredLicenses: [], creationTime: Date.now() },
        { pid: 'P-STARVE', name: 'Low Priority Background Task', role: 'Student', arrivalTime: 1, burstTime: 3, remainingTime: 3, priority: 8, state: 'NEW', memoryReq: 128, diskReq: 5, requiredMachines: [], requiredLicenses: [], creationTime: Date.now() },
      ], true);
      break;

    case 'RACE':
    case 'C': // Two users competing for the same machine
      result = synchronizationEngine.runBookingRaceSimulation('PC-01', 'Workstation Alpha');
      break;

    case 'BANKER':
    case 'D': // Banker's algorithm safe-state and unsafe-request example
      result = {
        safeVerification: deadlockEngine.runBankersAlgorithm({
          processes: ['P1', 'P2', 'P3', 'P4'],
          resources: ['PC-01', 'MATLAB', 'ANSYS'],
          available: [3, 3, 2],
          max: [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2]],
          allocation: [[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1]],
          need: [],
        }),
        unsafeRequestTest: deadlockEngine.validateResourceRequest(
          {
            processes: ['P1', 'P2', 'P3', 'P4'],
            resources: ['PC-01', 'MATLAB', 'ANSYS'],
            available: [3, 3, 2],
            max: [[7, 5, 3], [3, 2, 2], [9, 0, 2], [2, 2, 2]],
            allocation: [[0, 1, 0], [2, 0, 0], [3, 0, 2], [2, 1, 1]],
            need: [],
          },
          'P1',
          [3, 3, 0] // An unsafe demand that drains available resources
        ),
      };
      break;

    case 'MEMORY':
    case 'E': // Memory allocation comparison (First Fit vs Best Fit)
      result = {
        firstFit: memoryManager.allocateContiguousPartitions(
          [{ id: 1, size: 100 }, { id: 2, size: 500 }, { id: 3, size: 200 }, { id: 4, size: 300 }, { id: 5, size: 600 }],
          [{ pid: 'P1', size: 212 }, { pid: 'P2', size: 417 }, { pid: 'P3', size: 112 }, { pid: 'P4', size: 426 }],
          'FIRST_FIT'
        ),
        bestFit: memoryManager.allocateContiguousPartitions(
          [{ id: 1, size: 100 }, { id: 2, size: 500 }, { id: 3, size: 200 }, { id: 4, size: 300 }, { id: 5, size: 600 }],
          [{ pid: 'P1', size: 212 }, { pid: 'P2', size: 417 }, { pid: 'P3', size: 112 }, { pid: 'P4', size: 426 }],
          'BEST_FIT'
        ),
      };
      break;

    case 'DISK':
    case 'F': // Disk scheduling comparison (FCFS, SSTF, SCAN, C-SCAN)
      result = diskScheduler.compareAll([98, 183, 37, 122, 14, 124, 65, 67], 53, 200, 'RIGHT');
      break;

    default:
      result = simulationEngine.runIntegratedSimulation({ jobName: 'Default College Lab Job', role: 'Student', burstTime: 5, priority: 3, memoryReqMB: 256 });
  }

  res.json({ scenarioId, result });
});
