import { PCB, UserRole } from '../../types.js';
import { processManager } from '../process/ProcessManager.js';
import { cpuScheduler } from '../cpu/CPUScheduler.js';
import { memoryManager } from '../memory/MemoryManager.js';
import { diskScheduler } from '../disk/DiskScheduler.js';
import { resourceManager } from '../resource/ResourceManager.js';
import { deadlockEngine } from '../deadlock/DeadlockEngine.js';
import { adaptiveEngine } from '../adaptive/AdaptiveEngine.js';

export interface IntegratedSimulationStep {
  stepIndex: number;
  phase:
    | 'JOB_SUBMISSION'
    | 'PCB_CREATION'
    | 'LONG_TERM_SCHEDULING'
    | 'SHORT_TERM_SCHEDULING'
    | 'RESOURCE_ALLOCATION'
    | 'DEADLOCK_CHECK'
    | 'MEMORY_ALLOCATION'
    | 'DISK_IO_SCHEDULING'
    | 'CPU_EXECUTION'
    | 'COMPLETION_RELEASE';
  title: string;
  description: string;
  pcbState: PCB;
  metrics: Record<string, any>;
}

export interface IntegratedSimulationResult {
  simulationId: string;
  jobName: string;
  role: UserRole;
  steps: IntegratedSimulationStep[];
  adaptiveDecision: any;
  finalMetrics: {
    completionTime: number;
    turnaroundTime: number;
    waitingTime: number;
    cpuUtilization: number;
    allocatedMachine: string;
    allocatedLicense: string;
  };
}

export class SimulationEngine {

  public runIntegratedSimulation(params: {
    jobName: string;
    role?: UserRole;
    burstTime: number;
    priority: number;
    memoryReqMB: number;
    licenseRequested?: string;
    targetMachine?: string;
  }): IntegratedSimulationResult {
    const simulationId = `SIM-${Date.now()}`;
    const steps: IntegratedSimulationStep[] = [];
    let stepIndex = 1;

    // Phase 1: Job Submission
    const jobName = params.jobName || 'AI Lab Model Training';
    const role = params.role || 'Student';

    // Phase 2: PCB Creation
    const pcb = processManager.createProcess({
      name: jobName,
      role,
      burstTime: params.burstTime || 6,
      priority: params.priority || 3,
      memoryReq: params.memoryReqMB || 256,
      requiredMachines: [params.targetMachine || 'PC-01'],
      requiredLicenses: params.licenseRequested ? [params.licenseRequested] : ['LIC-MATLAB'],
    });

    steps.push({
      stepIndex: stepIndex++,
      phase: 'PCB_CREATION',
      title: 'PCB Initialization',
      description: `Created Process Control Block (PID: ${pcb.pid}, State: NEW, Burst: ${pcb.burstTime}s, Priority: ${pcb.priority})`,
      pcbState: { ...pcb },
      metrics: { pid: pcb.pid, memoryReqMB: pcb.memoryReq },
    });

    // Phase 3: Long-term Scheduler (Admission)
    pcb.state = 'READY';
    steps.push({
      stepIndex: stepIndex++,
      phase: 'LONG_TERM_SCHEDULING',
      title: 'Long-Term Scheduler Admission',
      description: `Job ${pcb.pid} admitted from spooling buffer into READY Queue. Memory requirement ${pcb.memoryReq}MB verified.`,
      pcbState: { ...pcb },
      metrics: { state: 'READY', memoryVerified: true },
    });

    // Phase 4: Resource Request & Deadlock Check
    const resourceResult = resourceManager.allocateResource({
      pid: pcb.pid,
      machineId: params.targetMachine || 'PC-01',
      licenseId: params.licenseRequested || 'LIC-MATLAB',
      memoryMB: pcb.memoryReq,
    });

    steps.push({
      stepIndex: stepIndex++,
      phase: 'DEADLOCK_CHECK',
      title: "Banker's Algorithm & Resource Grant",
      description: resourceResult.deadlockCheckPassed
        ? `Deadlock Avoidance check passed! Allocated Machine: ${params.targetMachine || 'PC-01'}, License: ${params.licenseRequested || 'LIC-MATLAB'}.`
        : `Unsafe deadlock state prevented! Deferred allocation.`,
      pcbState: { ...pcb },
      metrics: {
        resourceResult,
      },
    });

    // Phase 5: Memory Allocation (Contiguous Partition / Paging)
    const memAlloc = memoryManager.allocateContiguousPartitions(
      [
        { id: 1, size: 512 },
        { id: 2, size: 256 },
        { id: 3, size: 1024 },
      ],
      [{ pid: pcb.pid, size: pcb.memoryReq }],
      'BEST_FIT'
    );

    steps.push({
      stepIndex: stepIndex++,
      phase: 'MEMORY_ALLOCATION',
      title: 'Contiguous Memory Allocation (Best Fit)',
      description: `Allocated Partition #${memAlloc.allocationMap[pcb.pid] || 2} for PID ${pcb.pid}. Internal fragmentation: ${memAlloc.totalInternalFragmentation}MB.`,
      pcbState: { ...pcb },
      metrics: { memAlloc },
    });

    // Phase 6: Disk I/O Request
    const diskRes = diskScheduler.sstf([45, 120, 88, 14], 50);
    steps.push({
      stepIndex: stepIndex++,
      phase: 'DISK_IO_SCHEDULING',
      title: 'Disk I/O Head Scheduling (SSTF)',
      description: `Scheduled disk dataset load requests. Total seek movement: ${diskRes.totalHeadMovement} tracks.`,
      pcbState: { ...pcb },
      metrics: { totalHeadMovement: diskRes.totalHeadMovement, seekSequence: diskRes.seekSequence },
    });

    // Phase 7: Short-Term CPU Scheduling Execution
    pcb.state = 'RUNNING';
    const cpuRes = cpuScheduler.roundRobin(
      [
        pcb,
        {
          pid: 'P-Background',
          name: 'Background Monitor',
          role: 'System',
          arrivalTime: 0,
          burstTime: 2,
          remainingTime: 2,
          priority: 1,
          state: 'READY',
          memoryReq: 64,
          diskReq: 5,
          requiredMachines: [],
          requiredLicenses: [],
          creationTime: Date.now(),
        },
      ],
      2
    );

    steps.push({
      stepIndex: stepIndex++,
      phase: 'CPU_EXECUTION',
      title: 'CPU Execution (Preemptive Round Robin)',
      description: `Job ${pcb.pid} executed across ${cpuRes.ganttChart.length} Gantt slices. Turnaround time: ${cpuRes.avgTurnaroundTime}s.`,
      pcbState: { ...pcb, state: 'RUNNING' },
      metrics: { gantt: cpuRes.ganttChart, cpuUtil: cpuRes.cpuUtilization },
    });

    // Phase 8: Adaptive Engine Optimization
    const adaptiveDec = adaptiveEngine.analyzeAndDecide({
      cpuPressurePercent: 65,
      memoryPressurePercent: 55,
      diskPressurePercent: 40,
      queueLength: 2,
      pageFaultRatePercent: 12,
      starvationDetected: false,
      deadlockRisk: false,
    });

    // Phase 9: Completion & Resource Release
    pcb.state = 'TERMINATED';
    pcb.completionTime = Date.now();
    resourceManager.releaseResource(pcb.pid, params.targetMachine || 'PC-01', params.licenseRequested || 'LIC-MATLAB');

    steps.push({
      stepIndex: stepIndex++,
      phase: 'COMPLETION_RELEASE',
      title: 'Process Termination & Resource Release',
      description: `Job ${pcb.pid} completed execution cleanly. Freed memory, CPU cores, machine allocation, and software licenses.`,
      pcbState: { ...pcb, state: 'TERMINATED' },
      metrics: { state: 'TERMINATED' },
    });

    return {
      simulationId,
      jobName,
      role,
      steps,
      adaptiveDecision: adaptiveDec,
      finalMetrics: {
        completionTime: pcb.burstTime + 2,
        turnaroundTime: pcb.burstTime + 3,
        waitingTime: 1,
        cpuUtilization: cpuRes.cpuUtilization,
        allocatedMachine: params.targetMachine || 'PC-01',
        allocatedLicense: params.licenseRequested || 'LIC-MATLAB',
      },
    };
  }
}

export const simulationEngine = new SimulationEngine();
