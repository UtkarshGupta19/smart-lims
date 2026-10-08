export type ProcessState = 'NEW' | 'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED';

export type UserRole = 'Student' | 'Faculty' | 'System';

export interface PCB {
  pid: string;
  name: string;
  role: UserRole;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  priority: number; // lower number = higher priority
  state: ProcessState;
  memoryReq: number; // MB
  diskReq: number; // Block count / MB
  requiredMachines: string[];
  requiredLicenses: string[];
  creationTime: number;
  startTime?: number;
  completionTime?: number;
  turnaroundTime?: number;
  waitingTime?: number;
  responseTime?: number;
  quantumUsed?: number;
  queueLevel?: number; // for MLQ / MLFQ
}

export interface GanttSegment {
  pid: string;
  name: string;
  startTime: number;
  endTime: number;
  queueLevel?: number;
}

export interface CPUMetrics {
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  cpuUtilization: number; // percentage
  throughput: number; // processes per unit time
  contextSwitches: number;
  ganttChart: GanttSegment[];
  processes: PCB[];
}

export interface SchedulingResult extends CPUMetrics {
  algorithm: string;
  queueLogs?: string[];
  starvationAlerts?: string[];
}

// Thread Management
export type ThreadState = 'NEW' | 'RUNNABLE' | 'RUNNING' | 'BLOCKED' | 'TERMINATED';
export type ThreadModel = 'MANY_TO_ONE' | 'ONE_TO_ONE' | 'MANY_TO_MANY';

export interface ThreadInfo {
  tid: string;
  pid: string;
  name: string;
  state: ThreadState;
  userThreadId: string;
  kernelThreadId?: string;
  stackSizeKB: number;
  cpuShare: number;
}

export interface BackgroundWorkerStatus {
  id: string;
  name: string;
  type: 'MONITORING' | 'LOGGING' | 'BACKUP' | 'HEALTH_CHECK';
  status: 'ACTIVE' | 'IDLE' | 'PAUSED';
  lastRun: string;
  executionCount: number;
  threadCount: number;
}

// Concurrency
export interface RaceConditionSimResult {
  noLockFinalBalance: number;
  withLockFinalBalance: number;
  expectedBalance: number;
  stepTrace: Array<{
    step: number;
    threadId: string;
    action: string;
    noLockValue: number;
    withLockValue: number;
  }>;
}

export interface CriticalSectionStep {
  step: number;
  algorithm: string;
  processInCS: string | null;
  waitingQueue: string[];
  lockState: Record<string, any>;
  log: string;
}

export interface BoundedBufferStep {
  step: number;
  action: 'PRODUCE' | 'CONSUME' | 'BLOCKED_FULL' | 'BLOCKED_EMPTY';
  item?: string;
  buffer: string[];
  bufferSize: number;
  inIndex: number;
  outIndex: number;
  mutexState: boolean;
  emptySem: number;
  fullSem: number;
}

export interface DiningPhilosophersStep {
  step: number;
  philosophers: Array<{
    id: number;
    state: 'THINKING' | 'HUNGRY' | 'EATING';
    leftFork: boolean;
    rightFork: boolean;
  }>;
  forks: boolean[]; // true = available, false = held
  log: string;
}

export interface ReadersWritersStep {
  step: number;
  action: 'READ_START' | 'READ_END' | 'WRITE_START' | 'WRITE_END' | 'BLOCKED';
  activeReaders: string[];
  activeWriter: string | null;
  readerCount: number;
  rwMutexLocked: boolean;
  waitingQueue: string[];
  log: string;
}

export interface SleepingBarberStep {
  step: number;
  action: 'CUSTOMER_ARRIVES' | 'CUTTING' | 'CUSTOMER_WAITS' | 'CUSTOMER_LEAVES' | 'BARBER_SLEEPS';
  barberState: 'SLEEPING' | 'BUSY';
  currentCustomer: string | null;
  waitingChairs: string[];
  maxChairs: number;
  log: string;
}

// Deadlock
export interface ResourceMatrix {
  processes: string[]; // ['P1', 'P2', 'P3']
  resources: string[]; // ['PC-01', 'MATLAB', 'ANSYS']
  available: number[];
  max: number[][];
  allocation: number[][];
  need: number[][];
}

export interface BankerResult {
  isSafe: boolean;
  safeSequence: string[];
  stepLogs: string[];
  matrixState: ResourceMatrix;
}

export interface CycleDetectionResult {
  hasDeadlock: boolean;
  deadlockedProcesses: string[];
  waitForGraphEdges: Array<{ from: string; to: string; resource: string }>;
  ragEdges: Array<{ from: string; to: string; type: 'ALLOCATED' | 'REQUESTED' }>;
}

export interface DeadlockRecoveryResult {
  victimProcess: string;
  freedResources: Record<string, number>;
  newIsSafe: boolean;
  recoveryLog: string;
}

// Memory Management
export interface MemoryPartition {
  id: number;
  size: number;
  allocatedProcessId: string | null;
  internalFragmentation: number;
}

export interface PartitionAllocationResult {
  partitions: MemoryPartition[];
  unallocatedProcesses: string[];
  totalInternalFragmentation: number;
  totalExternalFragmentation: number;
  allocationMap: Record<string, number>; // pid -> partitionId
}

export interface PageTableEntry {
  pageNumber: number;
  frameNumber: number | null; // null if page fault / swapped
  valid: boolean;
  referenced: boolean;
  modified: boolean;
}

export interface PageReplacementStep {
  step: number;
  pageRequested: number;
  frames: (number | null)[];
  isPageFault: boolean;
  evictedPage: number | null;
}

export interface PageReplacementResult {
  algorithm: string;
  referenceString: number[];
  frameCount: number;
  pageFaultCount: number;
  pageFaultRate: number;
  hitCount: number;
  steps: PageReplacementStep[];
}

export interface BeladyResult {
  referenceString: number[];
  frame3Faults: number;
  frame4Faults: number;
  anomalyDetected: boolean;
  explanation: string;
}

// File Management
export interface LabFile {
  filename: string;
  sizeBlocks: number;
  allocationMethod: 'CONTIGUOUS' | 'LINKED' | 'INDEXED';
  startBlock?: number;
  blocks: number[];
  indexBlock?: number;
}

export interface FileSystemState {
  totalBlocks: number;
  freeBlocks: number;
  blockBitmap: boolean[]; // true = used, false = free
  files: LabFile[];
}

// Disk Management
export interface DiskScheduleResult {
  algorithm: string;
  requestQueue: number[];
  initialHead: number;
  seekSequence: number[];
  totalHeadMovement: number;
  avgSeekDistance: number;
  stepDetails: Array<{ step: number; currentHead: number; targetHead: number; distance: number }>;
}

// Lab Resources
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
}

export interface SoftwareLicense {
  id: string;
  name: string;
  totalLicenses: number;
  allocatedLicenses: number;
  availableLicenses: number;
  allocatedToProcesses: Record<string, number>; // pid -> count
}

export interface ResourceAllocationRequest {
  pid: string;
  machineId?: string;
  licenseId?: string;
  licenseCount?: number;
  memoryMB?: number;
}

// Adaptive Decision Engine
export interface SystemPressure {
  cpuPressurePercent: number; // 0-100
  memoryPressurePercent: number; // 0-100
  diskPressurePercent: number; // 0-100
  queueLength: number;
  pageFaultRatePercent: number; // 0-100
  starvationDetected: boolean;
  deadlockRisk: boolean;
}

export interface AdaptiveDecision {
  id: string;
  timestamp: string;
  decision: string;
  reason: string;
  bottleneck: 'CPU' | 'MEMORY' | 'DISK' | 'DEADLOCK' | 'STARVATION' | 'NONE';
  metricsUsed: SystemPressure;
  algorithmRecommended: string;
  actionTaken: string;
}

// System Logs
export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  module: string;
  message: string;
  details?: any;
}
