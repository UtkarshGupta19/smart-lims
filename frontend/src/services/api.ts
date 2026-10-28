import {
  SystemMetrics,
  PCB,
  SchedulingResult,
  LabMachine,
  SoftwareLicense,
  AdaptiveDecision,
  IntegratedSimulationResult,
  BookingRaceResult,
  DynamicMemoryState,
  DiskScheduleResult,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchMetrics(): Promise<SystemMetrics> {
  const res = await fetch(`${API_BASE}/system/metrics`);
  return res.json();
}

export async function fetchProcesses(): Promise<PCB[]> {
  const res = await fetch(`${API_BASE}/processes`);
  return res.json();
}

export async function createProcess(data: Partial<PCB>): Promise<PCB> {
  const res = await fetch(`${API_BASE}/processes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateProcessState(pid: string, state: string, reason?: string): Promise<PCB> {
  const res = await fetch(`${API_BASE}/processes/${pid}/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state, reason }),
  });
  return res.json();
}

export async function stepProcessSimulation(): Promise<{ clock: number; runningProcess: PCB | null; readyQueue: string[]; event: string }> {
  const res = await fetch(`${API_BASE}/processes/step`, { method: 'POST' });
  return res.json();
}

export async function resetProcessSimulation(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/processes/reset`, { method: 'POST' });
  return res.json();
}

export async function deleteProcess(pid: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/processes/${pid}`, { method: 'DELETE' });
  return res.json();
}

export async function runCPUScheduling(
  algorithm: string,
  processes?: PCB[],
  quantum?: number,
  applyAging?: boolean
): Promise<SchedulingResult> {
  const res = await fetch(`${API_BASE}/scheduling/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ algorithm, processes, quantum, applyAging }),
  });
  return res.json();
}

export async function fetchThreads() {
  const res = await fetch(`${API_BASE}/threads`);
  return res.json();
}

export async function simulateThreadMapping(model: string, userThreads: number, kernelThreads: number) {
  const res = await fetch(`${API_BASE}/threads/model-mapping`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, userThreads, kernelThreads }),
  });
  return res.json();
}

export async function runBookingRace(resourceId: string = 'PC-01', resourceName: string = 'Workstation Alpha'): Promise<BookingRaceResult> {
  const res = await fetch(`${API_BASE}/synchronization/booking-race`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resourceId, resourceName }),
  });
  return res.json();
}

export async function runRaceConditionSim() {
  const res = await fetch(`${API_BASE}/synchronization/race-condition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initialBalance: 100, iterations: 5 }),
  });
  return res.json();
}

export async function runCriticalSectionAlgo(algorithm: string) {
  const res = await fetch(`${API_BASE}/synchronization/critical-section`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ algorithm }),
  });
  return res.json();
}

export async function runBoundedBuffer(capacity: number = 4, steps: number = 6) {
  const res = await fetch(`${API_BASE}/synchronization/bounded-buffer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ capacity, steps }),
  });
  return res.json();
}

export async function runDiningPhilosophers() {
  const res = await fetch(`${API_BASE}/synchronization/dining-philosophers`, { method: 'POST' });
  return res.json();
}

export async function runReadersWriters() {
  const res = await fetch(`${API_BASE}/synchronization/readers-writers`, { method: 'POST' });
  return res.json();
}

export async function runSleepingBarber(chairs?: number) {
  const res = await fetch(`${API_BASE}/synchronization/sleeping-barber`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chairs }),
  });
  return res.json();
}

export async function fetchDeadlockConditions(): Promise<Array<{ condition: string; explanation: string; labExample: string; prevention: string }>> {
  const res = await fetch(`${API_BASE}/deadlock/conditions`);
  return res.json();
}

export async function runBankerAlgo(matrix?: any) {
  const res = await fetch(`${API_BASE}/deadlock/banker`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matrix }),
  });
  return res.json();
}

export async function validateBankerRequest(matrix: any, pid: string, request: number[]) {
  const res = await fetch(`${API_BASE}/deadlock/validate-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matrix, pid, request }),
  });
  return res.json();
}

export async function runDeadlockDetect(matrix?: any) {
  const res = await fetch(`${API_BASE}/deadlock/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matrix }),
  });
  return res.json();
}

export async function runDeadlockRecover(matrix?: any) {
  const res = await fetch(`${API_BASE}/deadlock/recover`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matrix }),
  });
  return res.json();
}

// Memory APIs
export async function fetchDynamicMemoryState(): Promise<DynamicMemoryState> {
  const res = await fetch(`${API_BASE}/memory/dynamic/state`);
  return res.json();
}

export async function allocateDynamicMemory(pid: string, processName: string, sizeMB: number, strategy: string) {
  const res = await fetch(`${API_BASE}/memory/dynamic/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pid, processName, sizeMB, strategy }),
  });
  return res.json();
}

export async function deallocateDynamicMemory(pidOrBlockId: string) {
  const res = await fetch(`${API_BASE}/memory/dynamic/deallocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pidOrBlockId }),
  });
  return res.json();
}

export async function resetDynamicMemory(totalMemoryMB?: number) {
  const res = await fetch(`${API_BASE}/memory/dynamic/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ totalMemoryMB }),
  });
  return res.json();
}

export async function allocateMemory(algorithm: string, partitions?: any[], requests?: any[]) {
  const res = await fetch(`${API_BASE}/memory/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ algorithm, partitions, requests }),
  });
  return res.json();
}

export async function runPageReplacement(algorithm: string, referenceString?: number[], frameCount?: number) {
  const res = await fetch(`${API_BASE}/memory/page-replacement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ algorithm, referenceString, frameCount }),
  });
  return res.json();
}

export async function fetchBelady() {
  const res = await fetch(`${API_BASE}/memory/belady`);
  return res.json();
}

// Disk APIs
export async function scheduleDisk(
  algorithm: string,
  queue?: number[],
  initialHead?: number,
  direction?: string,
  diskSize?: number
): Promise<DiskScheduleResult> {
  const res = await fetch(`${API_BASE}/disk/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ algorithm, queue, initialHead, direction, diskSize }),
  });
  return res.json();
}

export async function compareDiskAlgorithms(
  queue?: number[],
  initialHead?: number,
  diskSize?: number,
  direction?: string
) {
  const res = await fetch(`${API_BASE}/disk/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ queue, initialHead, diskSize, direction }),
  });
  return res.json();
}

// Resources APIs
export async function fetchMachines(): Promise<LabMachine[]> {
  const res = await fetch(`${API_BASE}/resources/machines`);
  return res.json();
}

export async function fetchLicenses(): Promise<SoftwareLicense[]> {
  const res = await fetch(`${API_BASE}/resources/licenses`);
  return res.json();
}

export async function fetchBookingAuditLogs(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/resources/audit-log`);
  return res.json();
}

export async function bookResource(booking: {
  machineId?: string;
  licenseId?: string;
  userName: string;
  pid: string;
  memoryMB?: number;
  licenseCount?: number;
}) {
  const res = await fetch(`${API_BASE}/resources/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  });
  return res.json();
}

export async function cancelResourceBooking(params: {
  machineId?: string;
  licenseId?: string;
  pid?: string;
  userName?: string;
}) {
  const res = await fetch(`${API_BASE}/resources/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function requestResource(pid: string, machineId?: string, licenseId?: string) {
  const res = await fetch(`${API_BASE}/resources/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pid, machineId, licenseId }),
  });
  return res.json();
}

export async function fetchAdaptiveHistory(): Promise<AdaptiveDecision[]> {
  const res = await fetch(`${API_BASE}/adaptive/history`);
  return res.json();
}

export async function runIntegratedSimulation(data: any): Promise<IntegratedSimulationResult> {
  const res = await fetch(`${API_BASE}/simulation/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function runPresetScenario(scenarioId: string) {
  const res = await fetch(`${API_BASE}/scenarios/run/${scenarioId}`, { method: 'POST' });
  return res.json();
}

export async function runLinuxMonitorScript(script: string) {
  const res = await fetch(`${API_BASE}/system/monitor/${script}`);
  return res.json();
}

export async function fetchSystemLogs(limit: number = 50) {
  const res = await fetch(`${API_BASE}/logs?limit=${limit}`);
  return res.json();
}

export async function fetchModernConcepts() {
  const res = await fetch(`${API_BASE}/system/modern-concepts`);
  return res.json();
}
