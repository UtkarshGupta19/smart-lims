import { SystemPressure, AdaptiveDecision } from '../../types.js';

export class AdaptiveEngine {
  private decisionHistory: AdaptiveDecision[] = [];

  public analyzeAndDecide(pressure: SystemPressure): AdaptiveDecision {
    const timestamp = new Date().toISOString();
    const id = `DEC-${Date.now()}`;
    let decision = '';
    let reason = '';
    let bottleneck: AdaptiveDecision['bottleneck'] = 'NONE';
    let algorithmRecommended = '';
    let actionTaken = '';

    // Rule 1: Deadlock Risk
    if (pressure.deadlockRisk) {
      bottleneck = 'DEADLOCK';
      decision = 'HOLD RESOURCE ALLOCATION & TRIGGER BANKER\'S ALGORITHM';
      reason = `Deadlock risk detected! Circular wait condition or unsafe allocation request identified.`;
      algorithmRecommended = "Banker's Algorithm + Wait-For Graph Cycle Detection";
      actionTaken = 'Delayed process allocation, verified safe sequence, and reclaimed victim resources.';
    }
    // Rule 2: Memory Pressure & Thrashing
    else if (pressure.memoryPressurePercent > 85 || pressure.pageFaultRatePercent > 70) {
      bottleneck = 'MEMORY';
      decision = 'SWAP OUT LOW-PRIORITY PROCESSES & SWITCH TO LRU PAGING';
      reason = `Memory pressure at ${pressure.memoryPressurePercent}% (Page fault rate: ${pressure.pageFaultRatePercent}%). Granting new memory would cause Thrashing.`;
      algorithmRecommended = 'Mid-Term Scheduler (Swapper) + LRU Demand Paging';
      actionTaken = 'Invoked Mid-Term Scheduler to swap out lowest priority processes to disk.';
    }
    // Rule 3: Starvation Detected
    else if (pressure.starvationDetected) {
      bottleneck = 'STARVATION';
      decision = 'APPLY AGING TO LOW-PRIORITY WAITING JOBS';
      reason = `Processes in ready queue waiting > 15 time units without execution due to higher priority jobs.`;
      algorithmRecommended = 'Priority Scheduling with Aging (Priority Promotion)';
      actionTaken = 'Promoted waiting student process priority from 5 -> 3 to guarantee execution.';
    }
    // Rule 4: CPU Overload
    else if (pressure.cpuPressurePercent > 80) {
      bottleneck = 'CPU';
      decision = 'SWITCH CPU SCHEDULER FROM FCFS TO ROUND ROBIN (q=2)';
      reason = `CPU utilization reached ${pressure.cpuPressurePercent}%. Long burst processes are blocking short jobs.`;
      algorithmRecommended = 'Preemptive Round Robin Scheduling (Quantum = 2ms)';
      actionTaken = 'Reconfigured Short-Term Scheduler to Round Robin to equalize CPU response time.';
    }
    // Rule 5: Heavy Disk I/O Concurrency
    else if (pressure.diskPressurePercent > 75) {
      bottleneck = 'DISK';
      decision = 'OPTIMIZE DISK REQUESTS VIA C-LOOK ALGORITHM';
      reason = `Disk request queue length reached ${pressure.queueLength}. Random head movement causing high seek latency.`;
      algorithmRecommended = 'C-LOOK Disk Head Scheduling';
      actionTaken = 'Re-ordered disk I/O requests to minimize total track seek movement.';
    }
    // Rule 6: Normal Balanced State
    else {
      bottleneck = 'NONE';
      decision = 'MAINTAIN OPTIMAL ADAPTIVE SCHEDULING';
      reason = `All system parameters within safe operational thresholds (CPU: ${pressure.cpuPressurePercent}%, Mem: ${pressure.memoryPressurePercent}%, Disk: ${pressure.diskPressurePercent}%).`;
      algorithmRecommended = 'Multilevel Feedback Queue (MLFQ)';
      actionTaken = 'System operating in optimal balanced adaptive mode.';
    }

    const result: AdaptiveDecision = {
      id,
      timestamp,
      decision,
      reason,
      bottleneck,
      metricsUsed: { ...pressure },
      algorithmRecommended,
      actionTaken,
    };

    this.decisionHistory.unshift(result);
    if (this.decisionHistory.length > 50) this.decisionHistory.pop();

    return result;
  }

  public getHistory(): AdaptiveDecision[] {
    return [...this.decisionHistory];
  }
}

export const adaptiveEngine = new AdaptiveEngine();
