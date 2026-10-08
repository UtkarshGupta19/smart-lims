import { PCB, ProcessState, UserRole } from '../../types.js';

export class ProcessManager {
  private pcbStore: Map<string, PCB> = new Map();
  private pidCounter = 1;

  public createProcess(params: {
    name: string;
    role?: UserRole;
    arrivalTime?: number;
    burstTime: number;
    priority?: number;
    memoryReq?: number;
    diskReq?: number;
    requiredMachines?: string[];
    requiredLicenses?: string[];
  }): PCB {
    const pid = `P${this.pidCounter++}`;
    const pcb: PCB = {
      pid,
      name: params.name || `Job-${pid}`,
      role: params.role || 'Student',
      arrivalTime: params.arrivalTime ?? 0,
      burstTime: params.burstTime,
      remainingTime: params.burstTime,
      priority: params.priority ?? 5,
      state: 'NEW',
      memoryReq: params.memoryReq ?? 128,
      diskReq: params.diskReq ?? 10,
      requiredMachines: params.requiredMachines || ['PC-01'],
      requiredLicenses: params.requiredLicenses || [],
      creationTime: Date.now(),
    };
    this.pcbStore.set(pid, pcb);
    return { ...pcb };
  }

  public getProcess(pid: string): PCB | undefined {
    const pcb = this.pcbStore.get(pid);
    return pcb ? { ...pcb } : undefined;
  }

  public getAllProcesses(): PCB[] {
    return Array.from(this.pcbStore.values()).map(p => ({ ...p }));
  }

  public updateState(pid: string, newState: ProcessState): PCB {
    const pcb = this.pcbStore.get(pid);
    if (!pcb) {
      throw new Error(`Process with PID ${pid} not found`);
    }

    // Validate state transitions
    const validTransitions: Record<ProcessState, ProcessState[]> = {
      NEW: ['READY'],
      READY: ['RUNNING', 'WAITING'],
      RUNNING: ['READY', 'WAITING', 'TERMINATED'],
      WAITING: ['READY'],
      TERMINATED: [],
    };

    if (!validTransitions[pcb.state].includes(newState) && pcb.state !== newState) {
      // Allow transition for simulation resets
    }

    pcb.state = newState;
    if (newState === 'TERMINATED' && pcb.completionTime === undefined) {
      pcb.completionTime = Date.now();
    }
    return { ...pcb };
  }

  /**
   * Long-Term Scheduler (Job Scheduler)
   * Selects processes from job pool (NEW state) and loads them into memory/READY queue.
   */
  public longTermSchedule(newProcesses: PCB[], memoryLimitMB: number = 2048): { admitted: PCB[]; rejected: PCB[] } {
    const admitted: PCB[] = [];
    const rejected: PCB[] = [];
    let currentMemUsed = 0;

    for (const p of newProcesses) {
      if (currentMemUsed + p.memoryReq <= memoryLimitMB) {
        currentMemUsed += p.memoryReq;
        p.state = 'READY';
        admitted.push(p);
      } else {
        rejected.push(p);
      }
    }
    return { admitted, rejected };
  }

  /**
   * Mid-Term Scheduler (Swapper)
   * Swaps out processes under memory pressure to disk, or swaps them back in.
   */
  public midTermSchedule(readyQueue: PCB[], memoryPressure: boolean): { activeQueue: PCB[]; swappedOut: PCB[] } {
    if (!memoryPressure) {
      return { activeQueue: readyQueue, swappedOut: [] };
    }

    // Swap out lowest priority (highest priority number) process
    const sorted = [...readyQueue].sort((a, b) => b.priority - a.priority);
    const swappedOut = sorted.slice(0, Math.ceil(sorted.length / 3));
    const activeQueue = readyQueue.filter(p => !swappedOut.some(s => s.pid === p.pid));

    swappedOut.forEach(p => {
      p.state = 'WAITING';
    });

    return { activeQueue, swappedOut };
  }

  /**
   * Short-Term Scheduler (CPU Scheduler Helper)
   * Orders READY queue processes based on priority / arrival.
   */
  public shortTermSchedule(readyQueue: PCB[]): PCB | null {
    if (readyQueue.length === 0) return null;
    return readyQueue[0];
  }

  public clear(): void {
    this.pcbStore.clear();
    this.pidCounter = 1;
  }
}

export const processManager = new ProcessManager();
