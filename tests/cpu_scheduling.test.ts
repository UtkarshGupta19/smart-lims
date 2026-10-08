import { describe, it, expect } from 'vitest';
import { CPUScheduler } from '../backend/src/core/cpu/CPUScheduler.js';
import { PCB } from '../backend/src/types.js';

describe('CPU Scheduling Algorithms', () => {
  const scheduler = new CPUScheduler();

  const sampleProcs: PCB[] = [
    { pid: 'P1', name: 'Job-1', role: 'Student', arrivalTime: 0, burstTime: 5, remainingTime: 5, priority: 2, state: 'NEW', memoryReq: 128, diskReq: 5, requiredMachines: [], requiredLicenses: [], creationTime: 0 },
    { pid: 'P2', name: 'Job-2', role: 'Faculty', arrivalTime: 1, burstTime: 3, remainingTime: 3, priority: 1, state: 'NEW', memoryReq: 128, diskReq: 5, requiredMachines: [], requiredLicenses: [], creationTime: 0 },
    { pid: 'P3', name: 'Job-3', role: 'Student', arrivalTime: 2, burstTime: 8, remainingTime: 8, priority: 3, state: 'NEW', memoryReq: 128, diskReq: 5, requiredMachines: [], requiredLicenses: [], creationTime: 0 },
  ];

  it('handles empty input gracefully', () => {
    const res = scheduler.fcfs([]);
    expect(res.processes).toEqual([]);
    expect(res.avgWaitingTime).toBe(0);
  });

  it('executes FCFS correctly', () => {
    const res = scheduler.fcfs(sampleProcs);
    expect(res.processes.length).toBe(3);
    expect(res.ganttChart.length).toBe(3);
    expect(res.avgWaitingTime).toBeGreaterThan(0);
  });

  it('executes SJF Non-Preemptive correctly', () => {
    const res = scheduler.sjfNonPreemptive(sampleProcs);
    expect(res.processes.length).toBe(3);
    expect(res.ganttChart[0].pid).toBe('P1');
  });

  it('executes SRTF (Preemptive) correctly', () => {
    const res = scheduler.srtf(sampleProcs);
    expect(res.processes.length).toBe(3);
    expect(res.ganttChart.length).toBeGreaterThanOrEqual(3);
  });

  it('executes Priority Scheduling correctly', () => {
    const resP = scheduler.priorityPreemptive(sampleProcs);
    expect(resP.processes.length).toBe(3);
    const resNP = scheduler.priorityNonPreemptive(sampleProcs);
    expect(resNP.processes.length).toBe(3);
  });

  it('executes Round Robin with Aging', () => {
    const res = scheduler.roundRobin(sampleProcs, 2, true);
    expect(res.processes.length).toBe(3);
    expect(res.ganttChart.length).toBeGreaterThan(3);
  });

  it('executes Multilevel Queue (MLQ)', () => {
    const res = scheduler.multilevelQueue(sampleProcs);
    expect(res.processes.length).toBe(3);
  });

  it('executes Multilevel Feedback Queue (MLFQ)', () => {
    const res = scheduler.multilevelFeedbackQueue(sampleProcs);
    expect(res.processes.length).toBe(3);
  });
});
