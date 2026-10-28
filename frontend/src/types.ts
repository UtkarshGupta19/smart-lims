export type ProcessState = 'NEW' | 'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED';
export type UserRole = 'Student' | 'Faculty' | 'System';

export interface StateTransitionEvent {
  from: ProcessState;
  to: ProcessState;
  timestamp: number;
  reason?: string;
}

export interface PCB {
  pid: string;
  name: string;
  role: UserRole;
  user?: string;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  priority: number;
  state: ProcessState;
  memoryReq: number;
  diskReq: number;
  requiredMachines: string[];
  requiredLicenses: string[];
  creationTime: number;
  startTime?: number;
  completionTime?: number;
  turnaroundTime?: number;
  waitingTime?: number;
  responseTime?: number;
  stateHistory?: StateTransitionEvent[];
}

export interface GanttSegment {
  pid: string;
  name: string;
  startTime: number;
  endTime: number;
  queueLevel?: number;
  isIdle?: boolean;
}

export interface SchedulingDecisionStep {
  time: number;
  runningPid: string | null;
  readyQueue: string[];
  decisionReason: string;
}

export interface SchedulingResult {
  algorithm: string;
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  cpuUtilization: number;
  throughput: number;
  contextSwitches: number;
  ganttChart: GanttSegment[];
  processes: PCB[];
  queueLogs?: string[];
  starvationAlerts?: string[];
  decisionSteps?: SchedulingDecisionStep[];
}

export interface SystemMetrics {
  cpuUtilization: number;
  memoryUtilization: number;
  diskUtilization: number;
  activeProcesses: number;
  readyQueueLength: number;
  waitingProcesses: number;
  pendingJobs: number;
  completedJobs: number;
  runningJobs: number;
  totalMachines: number;
  availableMachines: number;
  totalLicenses: number;
  availableLicenses: number;
  currentSchedulingAlgorithm: string;
  deadlockStatus: string;
  memoryPressure: string;
  diskPressure: string;
  currentBottleneck: string;
  recentEvents: Array<{ timestamp: string; module: string; message: string }>;
}

export interface LabMachine {
  id: string;
  name: string;
  cpuCapacityGhz: number;
  ramMB: number;
  diskGB: number;
  currentCpuUsagePercent: number;
  currentMemoryUsageMB: number;
  currentDiskUsageGB: number;
  installedSoftware: string[];
  isAvailable: boolean;
  activeProcessCount: number;
  assignedUser?: string;
  assignedPid?: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

export interface SoftwareLicense {
  id: string;
  name: string;
  totalLicenses: number;
  allocatedLicenses: number;
  availableLicenses: number;
  allocatedToProcesses: Record<string, number>;
}

export interface DynamicMemoryBlock {
  id: string;
  startAddress: number;
  size: number;
  isFree: boolean;
  pid: string | null;
  processName: string | null;
}

export interface DynamicMemoryState {
  totalMemoryMB: number;
  allocatedMemoryMB: number;
  freeMemoryMB: number;
  blocks: DynamicMemoryBlock[];
  largestFreeBlockMB: number;
  externalFragmentationMB: number;
}

export interface BookingRaceResult {
  resourceId: string;
  resourceName: string;
  unsynchronized: {
    steps: Array<{ step: number; threadId: string; action: string; lockHeld: boolean; resourceStatus: string }>;
    grantedBookings: string[];
    doubleBookingDetected: boolean;
    finalOwner: string;
    summary: string;
  };
  synchronized: {
    steps: Array<{ step: number; threadId: string; action: string; lockHeld: boolean; waitingQueue: string[]; resourceStatus: string }>;
    grantedBookings: string[];
    rejectedBookings: string[];
    doubleBookingDetected: boolean;
    finalOwner: string;
    summary: string;
  };
}

export interface DiskComparisonItem {
  algorithm: string;
  totalHeadMovement: number;
  avgSeekDistance: number;
  seekSequence: number[];
}

export interface DiskScheduleResult {
  algorithm: string;
  requestQueue: number[];
  initialHead: number;
  seekSequence: number[];
  totalHeadMovement: number;
  avgSeekDistance: number;
  stepDetails: Array<{ step: number; currentHead: number; targetHead: number; distance: number }>;
  comparison?: DiskComparisonItem[];
  diskSize?: number;
  direction?: 'LEFT' | 'RIGHT';
  boundaryAssumption?: string;
}

export interface AdaptiveDecision {
  id: string;
  timestamp: string;
  decision: string;
  reason: string;
  bottleneck: string;
  metricsUsed: any;
  algorithmRecommended: string;
  actionTaken: string;
}

export interface IntegratedSimulationStep {
  stepIndex: number;
  phase: string;
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
  adaptiveDecision: AdaptiveDecision;
  finalMetrics: {
    completionTime: number;
    turnaroundTime: number;
    waitingTime: number;
    cpuUtilization: number;
    allocatedMachine: string;
    allocatedLicense: string;
  };
}
