import { PCB, GanttSegment, SchedulingResult, SchedulingDecisionStep } from '../../types.js';

export class CPUScheduler {

  private computeMetrics(
    processes: PCB[],
    ganttChart: GanttSegment[],
    contextSwitches: number,
    algorithm: string,
    queueLogs?: string[],
    starvationAlerts?: string[],
    decisionSteps?: SchedulingDecisionStep[]
  ): SchedulingResult {
    const n = processes.length;
    if (n === 0) {
      return {
        algorithm,
        avgWaitingTime: 0,
        avgTurnaroundTime: 0,
        cpuUtilization: 0,
        throughput: 0,
        contextSwitches: 0,
        ganttChart: [],
        processes: [],
        queueLogs: [],
        starvationAlerts: [],
        decisionSteps: [],
      };
    }

    let totalWT = 0;
    let totalTAT = 0;
    let totalExecTime = 0;

    processes.forEach(p => {
      totalWT += p.waitingTime || 0;
      totalTAT += p.turnaroundTime || 0;
      totalExecTime += p.burstTime;
    });

    const maxCompletionTime = Math.max(...processes.map(p => p.completionTime || 0), 1);
    const minArrivalTime = Math.min(...processes.map(p => p.arrivalTime));
    const totalTimeSpan = Math.max(1, maxCompletionTime - minArrivalTime);

    const cpuUtilization = Math.min(100, (totalExecTime / totalTimeSpan) * 100);
    const throughput = Number((n / totalTimeSpan).toFixed(4));

    return {
      algorithm,
      avgWaitingTime: Number((totalWT / n).toFixed(2)),
      avgTurnaroundTime: Number((totalTAT / n).toFixed(2)),
      cpuUtilization: Number(cpuUtilization.toFixed(2)),
      throughput,
      contextSwitches,
      ganttChart,
      processes,
      queueLogs,
      starvationAlerts,
      decisionSteps,
    };
  }

  /**
   * 1. FCFS (First-Come First-Served)
   */
  public fcfs(inputProcesses: PCB[]): SchedulingResult {
    const procs = inputProcesses.map(p => ({ ...p, remainingTime: p.burstTime }));
    procs.sort((a, b) => a.arrivalTime - b.arrivalTime || a.pid.localeCompare(b.pid));

    let currentTime = 0;
    const gantt: GanttSegment[] = [];
    let contextSwitches = 0;
    let lastPid: string | null = null;
    const decisionSteps: SchedulingDecisionStep[] = [];

    procs.forEach((p, idx) => {
      if (currentTime < p.arrivalTime) {
        gantt.push({
          pid: 'IDLE',
          name: 'CPU Idle',
          startTime: currentTime,
          endTime: p.arrivalTime,
          isIdle: true,
        });
        decisionSteps.push({
          time: currentTime,
          runningPid: null,
          readyQueue: [],
          decisionReason: `CPU Idle: Next process (${p.pid}) arrives at t=${p.arrivalTime}`,
        });
        currentTime = p.arrivalTime;
      }

      if (p.responseTime === undefined) {
        p.responseTime = currentTime - p.arrivalTime;
      }
      if (lastPid && lastPid !== p.pid) {
        contextSwitches++;
      }

      const remainingReady = procs.slice(idx + 1).filter(r => r.arrivalTime <= currentTime).map(r => r.pid);
      decisionSteps.push({
        time: currentTime,
        runningPid: p.pid,
        readyQueue: remainingReady,
        decisionReason: `Dispatched ${p.pid} (${p.name}): First-come first-served queue head`,
      });

      const start = currentTime;
      currentTime += p.burstTime;
      p.completionTime = currentTime;
      p.turnaroundTime = p.completionTime - p.arrivalTime;
      p.waitingTime = p.turnaroundTime - p.burstTime;
      p.remainingTime = 0;
      p.state = 'TERMINATED';

      gantt.push({
        pid: p.pid,
        name: p.name,
        startTime: start,
        endTime: currentTime,
      });

      lastPid = p.pid;
    });

    return this.computeMetrics(procs, gantt, contextSwitches, 'FCFS', [], [], decisionSteps);
  }

  /**
   * 2. SJF Non-Preemptive
   */
  public sjfNonPreemptive(inputProcesses: PCB[]): SchedulingResult {
    const procs = inputProcesses.map(p => ({ ...p, remainingTime: p.burstTime }));
    const completed: PCB[] = [];
    const gantt: GanttSegment[] = [];
    let currentTime = 0;
    let contextSwitches = 0;
    let lastPid: string | null = null;
    const decisionSteps: SchedulingDecisionStep[] = [];

    while (completed.length < procs.length) {
      const available = procs.filter(p => p.arrivalTime <= currentTime && !completed.some(c => c.pid === p.pid));

      if (available.length === 0) {
        const uncompleted = procs.filter(p => !completed.some(c => c.pid === p.pid));
        const nextArrival = Math.min(...uncompleted.map(p => p.arrivalTime));
        gantt.push({
          pid: 'IDLE',
          name: 'CPU Idle',
          startTime: currentTime,
          endTime: nextArrival,
          isIdle: true,
        });
        currentTime = nextArrival;
        continue;
      }

      // Sort by burst time ascending, then arrival time
      available.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime || a.pid.localeCompare(b.pid));
      const p = available[0];

      if (lastPid && lastPid !== p.pid) {
        contextSwitches++;
      }

      p.responseTime = currentTime - p.arrivalTime;
      const start = currentTime;

      const readyIds = available.slice(1).map(x => x.pid);
      decisionSteps.push({
        time: currentTime,
        runningPid: p.pid,
        readyQueue: readyIds,
        decisionReason: `Selected ${p.pid}: Shortest burst time (${p.burstTime}s) among ready jobs`,
      });

      currentTime += p.burstTime;
      p.completionTime = currentTime;
      p.turnaroundTime = p.completionTime - p.arrivalTime;
      p.waitingTime = p.turnaroundTime - p.burstTime;
      p.remainingTime = 0;
      p.state = 'TERMINATED';

      gantt.push({
        pid: p.pid,
        name: p.name,
        startTime: start,
        endTime: currentTime,
      });

      completed.push(p);
      lastPid = p.pid;
    }

    return this.computeMetrics(procs, gantt, contextSwitches, 'SJF Non-Preemptive', [], [], decisionSteps);
  }

  /**
   * 3. SRTF (Shortest Remaining Time First - Preemptive)
   */
  public srtf(inputProcesses: PCB[]): SchedulingResult {
    const procs = inputProcesses.map(p => ({ ...p, remainingTime: p.burstTime }));
    const n = procs.length;
    if (n === 0) return this.computeMetrics([], [], 0, 'SRTF');

    const gantt: GanttSegment[] = [];
    let currentTime = 0;
    let completedCount = 0;
    let contextSwitches = 0;
    let currentProcess: PCB | null = null;
    let segmentStart = 0;
    const firstSeen: Map<string, number> = new Map();
    const decisionSteps: SchedulingDecisionStep[] = [];

    const minArrival = Math.min(...procs.map(p => p.arrivalTime));
    if (minArrival > 0) {
      gantt.push({ pid: 'IDLE', name: 'CPU Idle', startTime: 0, endTime: minArrival, isIdle: true });
      currentTime = minArrival;
    }

    while (completedCount < n) {
      const available = procs.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

      if (available.length === 0) {
        if (currentProcess) {
          gantt.push({
            pid: currentProcess.pid,
            name: currentProcess.name,
            startTime: segmentStart,
            endTime: currentTime,
          });
          currentProcess = null;
        }
        const remaining = procs.filter(p => p.remainingTime > 0);
        const nextTime = Math.min(...remaining.map(p => p.arrivalTime));
        gantt.push({ pid: 'IDLE', name: 'CPU Idle', startTime: currentTime, endTime: nextTime, isIdle: true });
        currentTime = nextTime;
        continue;
      }

      available.sort((a, b) => a.remainingTime - b.remainingTime || a.arrivalTime - b.arrivalTime || a.pid.localeCompare(b.pid));
      const chosen = available[0];

      if (!firstSeen.has(chosen.pid)) {
        firstSeen.set(chosen.pid, currentTime);
        chosen.responseTime = currentTime - chosen.arrivalTime;
      }

      if (currentProcess?.pid !== chosen.pid) {
        if (currentProcess) {
          gantt.push({
            pid: currentProcess.pid,
            name: currentProcess.name,
            startTime: segmentStart,
            endTime: currentTime,
          });
          contextSwitches++;
        }
        currentProcess = chosen;
        segmentStart = currentTime;

        decisionSteps.push({
          time: currentTime,
          runningPid: chosen.pid,
          readyQueue: available.slice(1).map(x => x.pid),
          decisionReason: `Preemption/Dispatch: ${chosen.pid} has shortest remaining time (${chosen.remainingTime}s)`,
        });
      }

      chosen.remainingTime--;
      currentTime++;

      if (chosen.remainingTime === 0) {
        chosen.completionTime = currentTime;
        chosen.turnaroundTime = chosen.completionTime - chosen.arrivalTime;
        chosen.waitingTime = chosen.turnaroundTime - chosen.burstTime;
        chosen.state = 'TERMINATED';
        completedCount++;

        gantt.push({
          pid: chosen.pid,
          name: chosen.name,
          startTime: segmentStart,
          endTime: currentTime,
        });
        currentProcess = null;
      }
    }

    return this.computeMetrics(procs, gantt, contextSwitches, 'SRTF', [], [], decisionSteps);
  }

  /**
   * 4. Priority Non-Preemptive
   */
  public priorityNonPreemptive(inputProcesses: PCB[]): SchedulingResult {
    const procs = inputProcesses.map(p => ({ ...p, remainingTime: p.burstTime }));
    const completed: PCB[] = [];
    const gantt: GanttSegment[] = [];
    let currentTime = 0;
    let contextSwitches = 0;
    let lastPid: string | null = null;
    const decisionSteps: SchedulingDecisionStep[] = [];

    while (completed.length < procs.length) {
      const available = procs.filter(p => p.arrivalTime <= currentTime && !completed.some(c => c.pid === p.pid));

      if (available.length === 0) {
        const uncompleted = procs.filter(p => !completed.some(c => c.pid === p.pid));
        const nextArrival = Math.min(...uncompleted.map(p => p.arrivalTime));
        gantt.push({ pid: 'IDLE', name: 'CPU Idle', startTime: currentTime, endTime: nextArrival, isIdle: true });
        currentTime = nextArrival;
        continue;
      }

      available.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime || a.pid.localeCompare(b.pid));
      const p = available[0];

      if (lastPid && lastPid !== p.pid) {
        contextSwitches++;
      }

      p.responseTime = currentTime - p.arrivalTime;
      const start = currentTime;

      decisionSteps.push({
        time: currentTime,
        runningPid: p.pid,
        readyQueue: available.slice(1).map(x => x.pid),
        decisionReason: `Selected ${p.pid}: Highest priority (Priority ${p.priority})`,
      });

      currentTime += p.burstTime;
      p.completionTime = currentTime;
      p.turnaroundTime = p.completionTime - p.arrivalTime;
      p.waitingTime = p.turnaroundTime - p.burstTime;
      p.remainingTime = 0;
      p.state = 'TERMINATED';

      gantt.push({
        pid: p.pid,
        name: p.name,
        startTime: start,
        endTime: currentTime,
      });

      completed.push(p);
      lastPid = p.pid;
    }

    return this.computeMetrics(procs, gantt, contextSwitches, 'Priority Non-Preemptive', [], [], decisionSteps);
  }

  /**
   * 5. Priority Preemptive with Aging option
   */
  public priorityPreemptive(inputProcesses: PCB[], applyAging: boolean = false): SchedulingResult {
    const procs = inputProcesses.map(p => ({ ...p, remainingTime: p.burstTime }));
    const n = procs.length;
    if (n === 0) return this.computeMetrics([], [], 0, 'Priority Preemptive');

    const gantt: GanttSegment[] = [];
    let currentTime = 0;
    let completedCount = 0;
    let contextSwitches = 0;
    let currentProcess: PCB | null = null;
    let segmentStart = 0;
    const firstSeen = new Map<string, number>();
    const decisionSteps: SchedulingDecisionStep[] = [];
    const starvationAlerts: string[] = [];

    const minArrival = Math.min(...procs.map(p => p.arrivalTime));
    if (minArrival > 0) {
      gantt.push({ pid: 'IDLE', name: 'CPU Idle', startTime: 0, endTime: minArrival, isIdle: true });
      currentTime = minArrival;
    }

    while (completedCount < n) {
      // Check aging
      if (applyAging && currentTime > 0) {
        procs.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0 && p.pid !== currentProcess?.pid).forEach(waitProc => {
          const waitDuration = currentTime - waitProc.arrivalTime - (waitProc.burstTime - waitProc.remainingTime);
          if (waitDuration >= 6 && waitProc.priority > 1) {
            waitProc.priority -= 1;
            const alert = `Aging applied to ${waitProc.pid}: Waiting ${waitDuration}s -> Priority promoted to ${waitProc.priority}`;
            if (!starvationAlerts.includes(alert)) {
              starvationAlerts.push(alert);
            }
          }
        });
      }

      const available = procs.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

      if (available.length === 0) {
        if (currentProcess) {
          gantt.push({
            pid: currentProcess.pid,
            name: currentProcess.name,
            startTime: segmentStart,
            endTime: currentTime,
          });
          currentProcess = null;
        }
        const remaining = procs.filter(p => p.remainingTime > 0);
        const nextTime = Math.min(...remaining.map(p => p.arrivalTime));
        gantt.push({ pid: 'IDLE', name: 'CPU Idle', startTime: currentTime, endTime: nextTime, isIdle: true });
        currentTime = nextTime;
        continue;
      }

      available.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime || a.pid.localeCompare(b.pid));
      const chosen = available[0];

      if (!firstSeen.has(chosen.pid)) {
        firstSeen.set(chosen.pid, currentTime);
        chosen.responseTime = currentTime - chosen.arrivalTime;
      }

      if (currentProcess?.pid !== chosen.pid) {
        if (currentProcess) {
          gantt.push({
            pid: currentProcess.pid,
            name: currentProcess.name,
            startTime: segmentStart,
            endTime: currentTime,
          });
          contextSwitches++;
        }
        currentProcess = chosen;
        segmentStart = currentTime;

        decisionSteps.push({
          time: currentTime,
          runningPid: chosen.pid,
          readyQueue: available.slice(1).map(x => `${x.pid}(pri=${x.priority})`),
          decisionReason: `Preempted/Dispatched ${chosen.pid}: Highest priority (${chosen.priority})`,
        });
      }

      chosen.remainingTime--;
      currentTime++;

      if (chosen.remainingTime === 0) {
        chosen.completionTime = currentTime;
        chosen.turnaroundTime = chosen.completionTime - chosen.arrivalTime;
        chosen.waitingTime = chosen.turnaroundTime - chosen.burstTime;
        chosen.state = 'TERMINATED';
        completedCount++;

        gantt.push({
          pid: chosen.pid,
          name: chosen.name,
          startTime: segmentStart,
          endTime: currentTime,
        });
        currentProcess = null;
      }
    }

    return this.computeMetrics(procs, gantt, contextSwitches, 'Priority Preemptive', [], starvationAlerts, decisionSteps);
  }

  /**
   * 6. Round Robin (with Time Quantum and Aging)
   */
  public roundRobin(inputProcesses: PCB[], quantum: number = 2, applyAging: boolean = false): SchedulingResult {
    const procs = inputProcesses.map(p => ({ ...p, remainingTime: p.burstTime }));
    const n = procs.length;
    if (n === 0) return this.computeMetrics([], [], 0, `Round Robin (q=${quantum})`);

    const gantt: GanttSegment[] = [];
    const queue: PCB[] = [];
    const inQueue = new Set<string>();
    const firstSeen = new Map<string, number>();
    const starvationAlerts: string[] = [];
    const decisionSteps: SchedulingDecisionStep[] = [];

    let currentTime = 0;
    let completedCount = 0;
    let contextSwitches = 0;
    let lastPid: string | null = null;

    const minArrival = Math.min(...procs.map(p => p.arrivalTime));
    if (minArrival > 0) {
      gantt.push({ pid: 'IDLE', name: 'CPU Idle', startTime: 0, endTime: minArrival, isIdle: true });
      currentTime = minArrival;
    }

    // Push initial processes arriving at currentTime
    procs.filter(p => p.arrivalTime <= currentTime).forEach(p => {
      queue.push(p);
      inQueue.add(p.pid);
    });

    while (completedCount < n) {
      if (queue.length === 0) {
        const remaining = procs.filter(p => p.remainingTime > 0 && !inQueue.has(p.pid));
        if (remaining.length > 0) {
          const nextArrival = Math.min(...remaining.map(r => r.arrivalTime));
          gantt.push({ pid: 'IDLE', name: 'CPU Idle', startTime: currentTime, endTime: nextArrival, isIdle: true });
          currentTime = nextArrival;
          procs.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0 && !inQueue.has(p.pid)).forEach(p => {
            queue.push(p);
            inQueue.add(p.pid);
          });
        } else {
          break;
        }
      }

      const p = queue.shift()!;
      inQueue.delete(p.pid);

      if (!firstSeen.has(p.pid)) {
        firstSeen.set(p.pid, currentTime);
        p.responseTime = currentTime - p.arrivalTime;
      }

      if (lastPid && lastPid !== p.pid) {
        contextSwitches++;
      }

      const execTime = Math.min(quantum, p.remainingTime);
      const start = currentTime;

      decisionSteps.push({
        time: currentTime,
        runningPid: p.pid,
        readyQueue: queue.map(q => q.pid),
        decisionReason: `RR Time Slice: Allocated up to ${quantum}s to ${p.pid} (remaining: ${p.remainingTime}s)`,
      });

      currentTime += execTime;
      p.remainingTime -= execTime;

      gantt.push({
        pid: p.pid,
        name: p.name,
        startTime: start,
        endTime: currentTime,
      });

      lastPid = p.pid;

      // Add newly arrived processes while p was executing
      procs.filter(proc => proc.arrivalTime <= currentTime && proc.remainingTime > 0 && proc.pid !== p.pid && !inQueue.has(proc.pid) && !queue.some(q => q.pid === proc.pid)).forEach(proc => {
        queue.push(proc);
        inQueue.add(proc.pid);
      });

      // If p still has remaining time, push to back of queue
      if (p.remainingTime > 0) {
        queue.push(p);
        inQueue.add(p.pid);
      } else {
        p.completionTime = currentTime;
        p.turnaroundTime = p.completionTime - p.arrivalTime;
        p.waitingTime = p.turnaroundTime - p.burstTime;
        p.state = 'TERMINATED';
        completedCount++;
      }

      // Aging check in Round Robin
      if (applyAging) {
        queue.forEach(waitProc => {
          const timeWaiting = currentTime - waitProc.arrivalTime - (waitProc.burstTime - waitProc.remainingTime);
          if (timeWaiting >= 8 && waitProc.priority > 1) {
            waitProc.priority -= 1;
            const alert = `Aging: Process ${waitProc.pid} waited ${timeWaiting}s -> Priority promoted to ${waitProc.priority}`;
            if (!starvationAlerts.includes(alert)) {
              starvationAlerts.push(alert);
            }
          }
        });
      }
    }

    return this.computeMetrics(procs, gantt, contextSwitches, `Round Robin (q=${quantum})`, [], starvationAlerts, decisionSteps);
  }

  /**
   * 7. Multilevel Queue (MLQ)
   * Queue 1: System Jobs (Highest Priority)
   * Queue 2: Faculty Jobs (Medium Priority)
   * Queue 3: Student Jobs (Lowest Priority)
   */
  public multilevelQueue(inputProcesses: PCB[]): SchedulingResult {
    const procs = inputProcesses.map(p => ({ ...p, remainingTime: p.burstTime }));
    const systemQ = procs.filter(p => p.role === 'System');
    const facultyQ = procs.filter(p => p.role === 'Faculty');
    const studentQ = procs.filter(p => p.role === 'Student' || !p.role);

    const queueLogs: string[] = [
      `MLQ Initialized: System Queue (${systemQ.length} jobs, RR q=2), Faculty Queue (${facultyQ.length} jobs, SJF), Student Queue (${studentQ.length} jobs, FCFS)`
    ];

    const systemRes = this.roundRobin(systemQ, 2);
    let offset = systemRes.ganttChart.length > 0 ? Math.max(...systemRes.ganttChart.map(g => g.endTime)) : 0;

    const facultyAdjusted = facultyQ.map(p => ({ ...p, arrivalTime: Math.max(p.arrivalTime, offset) }));
    const facultyRes = this.sjfNonPreemptive(facultyAdjusted);
    offset = facultyRes.ganttChart.length > 0 ? Math.max(...facultyRes.ganttChart.map(g => g.endTime)) : offset;

    const studentAdjusted = studentQ.map(p => ({ ...p, arrivalTime: Math.max(p.arrivalTime, offset) }));
    const studentRes = this.fcfs(studentAdjusted);

    const mergedGantt: GanttSegment[] = [
      ...systemRes.ganttChart.map(g => ({ ...g, queueLevel: 1 })),
      ...facultyRes.ganttChart.map(g => ({ ...g, queueLevel: 2 })),
      ...studentRes.ganttChart.map(g => ({ ...g, queueLevel: 3 })),
    ];

    const mergedProcs = [...systemRes.processes, ...facultyRes.processes, ...studentRes.processes];
    mergedProcs.forEach(p => {
      const orig = inputProcesses.find(o => o.pid === p.pid);
      if (orig && p.completionTime !== undefined) {
        p.arrivalTime = orig.arrivalTime;
        p.turnaroundTime = p.completionTime - p.arrivalTime;
        p.waitingTime = Math.max(0, p.turnaroundTime - p.burstTime);
      }
    });

    const contextSwitches = systemRes.contextSwitches + facultyRes.contextSwitches + studentRes.contextSwitches;

    return this.computeMetrics(mergedProcs, mergedGantt, contextSwitches, 'Multilevel Queue (MLQ)', queueLogs);
  }

  /**
   * 8. Multilevel Feedback Queue (MLFQ)
   * Queue 1: RR (q=2)
   * Queue 2: RR (q=4)
   * Queue 3: FCFS
   * Demotion on quantum expiration. Promotion on waiting time threshold.
   */
  public multilevelFeedbackQueue(inputProcesses: PCB[]): SchedulingResult {
    const procs = inputProcesses.map(p => ({ ...p, remainingTime: p.burstTime, queueLevel: 1 }));
    const gantt: GanttSegment[] = [];
    const queueLogs: string[] = [];
    const q1: PCB[] = [];
    const q2: PCB[] = [];
    const q3: PCB[] = [];

    let currentTime = 0;
    let completedCount = 0;
    let contextSwitches = 0;
    let lastPid: string | null = null;
    const firstSeen = new Map<string, number>();

    procs.sort((a, b) => a.arrivalTime - b.arrivalTime).forEach(p => {
      if (p.arrivalTime === 0) {
        q1.push(p);
      }
    });

    while (completedCount < procs.length) {
      procs.forEach(p => {
        if (p.arrivalTime <= currentTime && p.remainingTime > 0 && p.queueLevel === 1 && !q1.some(q => q.pid === p.pid) && !q2.some(q => q.pid === p.pid) && !q3.some(q => q.pid === p.pid)) {
          q1.push(p);
        }
      });

      let currentProc: PCB | null = null;
      let activeQ = 0;
      let quantum = 0;

      if (q1.length > 0) {
        currentProc = q1.shift()!;
        activeQ = 1;
        quantum = 2;
      } else if (q2.length > 0) {
        currentProc = q2.shift()!;
        activeQ = 2;
        quantum = 4;
      } else if (q3.length > 0) {
        currentProc = q3.shift()!;
        activeQ = 3;
        quantum = currentProc.remainingTime; // FCFS
      }

      if (!currentProc) {
        const remaining = procs.filter(p => p.remainingTime > 0);
        if (remaining.length === 0) break;
        currentTime++;
        continue;
      }

      if (!firstSeen.has(currentProc.pid)) {
        firstSeen.set(currentProc.pid, currentTime);
        currentProc.responseTime = currentTime - currentProc.arrivalTime;
      }

      if (lastPid && lastPid !== currentProc.pid) {
        contextSwitches++;
      }

      const runTime = Math.min(quantum, currentProc.remainingTime);
      const start = currentTime;
      currentTime += runTime;
      currentProc.remainingTime -= runTime;

      gantt.push({
        pid: currentProc.pid,
        name: currentProc.name,
        startTime: start,
        endTime: currentTime,
        queueLevel: activeQ,
      });

      lastPid = currentProc.pid;

      if (currentProc.remainingTime === 0) {
        currentProc.completionTime = currentTime;
        currentProc.turnaroundTime = currentProc.completionTime - currentProc.arrivalTime;
        currentProc.waitingTime = currentProc.turnaroundTime - currentProc.burstTime;
        currentProc.state = 'TERMINATED';
        completedCount++;
        queueLogs.push(`Process ${currentProc.pid} completed in Queue ${activeQ} at t=${currentTime}`);
      } else {
        // Demote
        if (activeQ === 1) {
          currentProc.queueLevel = 2;
          q2.push(currentProc);
          queueLogs.push(`Process ${currentProc.pid} demoted Q1 -> Q2 at t=${currentTime} (used full 2s slice)`);
        } else if (activeQ === 2) {
          currentProc.queueLevel = 3;
          q3.push(currentProc);
          queueLogs.push(`Process ${currentProc.pid} demoted Q2 -> Q3 at t=${currentTime} (used full 4s slice)`);
        } else {
          q3.push(currentProc);
        }
      }

      // Aging promotion from Q3 -> Q2
      q3.forEach((p, idx) => {
        const timeInQ3 = currentTime - (p.completionTime || start);
        if (timeInQ3 >= 12) {
          p.queueLevel = 2;
          q3.splice(idx, 1);
          q2.push(p);
          queueLogs.push(`Process ${p.pid} promoted Q3 -> Q2 due to aging at t=${currentTime}`);
        }
      });
    }

    return this.computeMetrics(procs, gantt, contextSwitches, 'Multilevel Feedback Queue (MLFQ)', queueLogs);
  }
}

export const cpuScheduler = new CPUScheduler();
