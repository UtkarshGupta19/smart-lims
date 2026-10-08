export type ProcessState = 'NEW' | 'READY' | 'RUNNING' | 'WAITING' | 'TERMINATED';
export type UserRole = 'Student' | 'Faculty' | 'System';

export interface PCB {
  pid: string;
  name: string;
  role: UserRole;
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
}

export interface GanttSegment {
  pid: string;
  name: string;
  startTime: number;
  endTime: number;
  queueLevel?: number;
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
}

export interface SystemMetrics {
  cpuUtilization: number;
  memoryUtilization: number;
  diskUtilization: number;
  activeProcesses: number;
  readyQueueLength: number;
  waitingProcesses: number;
  availableMachines: number;
  availableLicenses: number;
  deadlockStatus: string;
  memoryPressure: string;
  diskPressure: string;
  currentBottleneck: string;
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
}

export interface SoftwareLicense {
  id: string;
  name: string;
  totalLicenses: number;
  allocatedLicenses: number;
  availableLicenses: number;
  allocatedToProcesses: Record<string, number>;
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
