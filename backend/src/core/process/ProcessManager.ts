import { PCB, ProcessState, UserRole, StateTransitionEvent } from '../../types.js';
import { logEvent } from '../../database/db.js';

export class ProcessManager {
  private pcbStore: Map<string, PCB> = new Map();
  private pidCounter = 1;
  private simulationClock = 0;
  private isSimulationRunning = false;

  constructor() {
    this.seedDefaultProcesses();
  }

  public seedDefaultProcesses(): void {
    this.pcbStore.clear();
    this.pidCounter = 1;
    this.simulationClock = 0;
    this.isSimulationRunning = false;

    const initialProcesses = [
      { name: 'MATLAB Numerical Simulation', user: 'Dr. Alan Turing', role: 'Faculty' as UserRole, arrivalTime: 0, burstTime: 6, priority: 2, memoryReq: 256, diskReq: 15, requiredMachines: ['PC-01'], requiredLicenses: ['LIC-MATLAB'] },
      { name: 'ANSYS Finite Element Run', user: 'Ada Lovelace', role: 'Student' as UserRole, arrivalTime: 1, burstTime: 4, priority: 3, memoryReq: 512, diskReq: 30, requiredMachines: ['PC-02'], requiredLicenses: ['LIC-ANSYS'] },
      { name: 'System Security Kernel Audit', user: 'Lab Daemon', role: 'System' as UserRole, arrivalTime: 2, burstTime: 3, priority: 1, memoryReq: 128, diskReq: 5, requiredMachines: ['PC-05'], requiredLicenses: [] },
      { name: 'Cadence VLSI Circuit Synth', user: 'Claude Shannon', role: 'Faculty' as UserRole, arrivalTime: 3, burstTime: 7, priority: 2, memoryReq: 384, diskReq: 20, requiredMachines: ['PC-03'], requiredLicenses: ['LIC-CADENCE'] },
      { name: 'Python Data Analysis Script', user: 'Grace Hopper', role: 'Student' as UserRole, arrivalTime: 4, burstTime: 5, priority: 4, memoryReq: 192, diskReq: 10, requiredMachines: ['PC-01'], requiredLicenses: [] },
    ];

    initialProcesses.forEach(p => {
      this.createProcess({
        ...p,
        state: 'READY',
      });
    });
  }

  public createProcess(params: {
    name: string;
    user?: string;
    role?: UserRole;
    arrivalTime?: number;
    burstTime: number;
    priority?: number;
    memoryReq?: number;
    diskReq?: number;
    requiredMachines?: string[];
    requiredLicenses?: string[];
    state?: ProcessState;
  }): PCB {
    const pid = `P${this.pidCounter++}`;
    const initialArrival = Math.max(0, params.arrivalTime ?? 0);
    const initialBurst = Math.max(1, params.burstTime);
    const initialState = params.state || 'NEW';
    const now = Date.now();

    const pcb: PCB = {
      pid,
      name: params.name || `Job-${pid}`,
      user: params.user || (params.role === 'Faculty' ? 'Faculty Member' : params.role === 'System' ? 'System Daemon' : 'Student Researcher'),
      role: params.role || 'Student',
      arrivalTime: initialArrival,
      burstTime: initialBurst,
      remainingTime: initialBurst,
      priority: Math.max(1, Math.min(10, params.priority ?? 5)),
      state: initialState,
      memoryReq: Math.max(16, params.memoryReq ?? 128),
      diskReq: Math.max(1, params.diskReq ?? 10),
      requiredMachines: params.requiredMachines || ['PC-01'],
      requiredLicenses: params.requiredLicenses || [],
      creationTime: now,
      stateHistory: [
        {
          from: 'NEW',
          to: initialState,
          timestamp: this.simulationClock,
          reason: 'Process admitted to system job queue',
        },
      ],
    };

    this.pcbStore.set(pid, pcb);
    logEvent('INFO', 'PROCESS_MANAGER', `Created PCB ${pid} (${pcb.name}) in state ${initialState}`);
    return { ...pcb };
  }

  public getProcess(pid: string): PCB | undefined {
    const pcb = this.pcbStore.get(pid);
    return pcb ? JSON.parse(JSON.stringify(pcb)) : undefined;
  }

  public getAllProcesses(): PCB[] {
    return Array.from(this.pcbStore.values()).map(p => JSON.parse(JSON.stringify(p)));
  }

  public getSimulationClock(): number {
    return this.simulationClock;
  }

  public updateState(pid: string, newState: ProcessState, reason?: string): PCB {
    const pcb = this.pcbStore.get(pid);
    if (!pcb) {
      throw new Error(`Process with PID ${pid} not found`);
    }

    const currentState = pcb.state;
    if (currentState === newState) {
      return { ...pcb };
    }

    // OS Standard State Transitions validation
    const validTransitions: Record<ProcessState, ProcessState[]> = {
      NEW: ['READY'],
      READY: ['RUNNING', 'WAITING', 'TERMINATED'],
      RUNNING: ['READY', 'WAITING', 'TERMINATED'],
      WAITING: ['READY', 'TERMINATED'],
      TERMINATED: ['READY', 'NEW'], // Allow re-queueing on simulation reset
    };

    if (!validTransitions[currentState].includes(newState)) {
      logEvent('WARN', 'PROCESS_MANAGER', `Unusual transition forced for ${pid}: ${currentState} -> ${newState}`);
    }

    const transitionEvent: StateTransitionEvent = {
      from: currentState,
      to: newState,
      timestamp: this.simulationClock,
      reason: reason || `Transitioned from ${currentState} to ${newState}`,
    };

    if (!pcb.stateHistory) {
      pcb.stateHistory = [];
    }
    pcb.stateHistory.push(transitionEvent);
    pcb.state = newState;

    if (newState === 'RUNNING' && pcb.startTime === undefined) {
      pcb.startTime = this.simulationClock;
      pcb.responseTime = this.simulationClock - pcb.arrivalTime;
    }

    if (newState === 'TERMINATED') {
      pcb.completionTime = this.simulationClock;
      pcb.turnaroundTime = Math.max(0, pcb.completionTime - pcb.arrivalTime);
      pcb.waitingTime = Math.max(0, pcb.turnaroundTime - pcb.burstTime);
      pcb.remainingTime = 0;
    }

    logEvent('INFO', 'PROCESS_MANAGER', `Process ${pid} state updated: ${currentState} -> ${newState} (${reason || 'state update'})`);
    return { ...pcb };
  }

  /**
   * Execute 1 discrete simulation step (tick)
   */
  public stepSimulation(): {
    clock: number;
    runningProcess: PCB | null;
    readyQueue: string[];
    event: string;
  } {
    this.simulationClock += 1;
    const currentClock = this.simulationClock;

    // 1. Admit any newly arrived processes
    for (const pcb of this.pcbStore.values()) {
      if (pcb.state === 'NEW' && pcb.arrivalTime <= currentClock) {
        this.updateState(pcb.pid, 'READY', `Job arrived at clock ${currentClock} and admitted to READY queue`);
      }
    }

    // 2. Identify currently RUNNING process
    let running: PCB | null = Array.from(this.pcbStore.values()).find(p => p.state === 'RUNNING') || null;

    // 3. If no process is running, select highest priority from READY queue
    if (!running) {
      const readyProcesses = Array.from(this.pcbStore.values())
        .filter(p => p.state === 'READY')
        .sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);

      if (readyProcesses.length > 0) {
        const next = readyProcesses[0];
        this.updateState(next.pid, 'RUNNING', `Dispatched to CPU (Priority ${next.priority})`);
        running = next;
      }
    }

    let event = `Simulation tick at t=${currentClock}`;

    // 4. If running, execute 1 burst unit
    if (running) {
      running.remainingTime = Math.max(0, running.remainingTime - 1);
      event = `Process ${running.pid} (${running.name}) executed on CPU for 1s. Remaining: ${running.remainingTime}s`;

      if (running.remainingTime === 0) {
        this.updateState(running.pid, 'TERMINATED', `Execution finished at t=${currentClock}`);
        event += ` ➜ Completed and Terminated!`;
        running = null;
      }
    } else {
      event = `CPU Idle at t=${currentClock} (Ready queue is empty)`;
    }

    const readyQueue = Array.from(this.pcbStore.values())
      .filter(p => p.state === 'READY')
      .map(p => p.pid);

    return {
      clock: currentClock,
      runningProcess: running ? { ...running } : null,
      readyQueue,
      event,
    };
  }

  public resetSimulation(): void {
    this.simulationClock = 0;
    this.isSimulationRunning = false;

    // Reset processes back to initial parameters
    for (const pcb of this.pcbStore.values()) {
      pcb.state = pcb.arrivalTime === 0 ? 'READY' : 'NEW';
      pcb.remainingTime = pcb.burstTime;
      pcb.startTime = undefined;
      pcb.completionTime = undefined;
      pcb.turnaroundTime = undefined;
      pcb.waitingTime = undefined;
      pcb.responseTime = undefined;
      pcb.stateHistory = [
        {
          from: 'NEW',
          to: pcb.state,
          timestamp: 0,
          reason: 'Simulation reset to t=0',
        },
      ];
    }

    logEvent('INFO', 'PROCESS_MANAGER', 'Simulation reset: all processes restored to initial state');
  }

  public removeProcess(pid: string): boolean {
    const deleted = this.pcbStore.delete(pid);
    if (deleted) {
      logEvent('INFO', 'PROCESS_MANAGER', `Removed process ${pid}`);
    }
    return deleted;
  }

  public clear(): void {
    this.pcbStore.clear();
    this.pidCounter = 1;
    this.simulationClock = 0;
  }
}

export const processManager = new ProcessManager();
