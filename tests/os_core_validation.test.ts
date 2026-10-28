import { describe, it, expect } from 'vitest';
import { CPUScheduler } from '../backend/src/core/cpu/CPUScheduler.js';
import { ProcessManager } from '../backend/src/core/process/ProcessManager.js';
import { DeadlockEngine } from '../backend/src/core/deadlock/DeadlockEngine.js';
import { MemoryManager } from '../backend/src/core/memory/MemoryManager.js';
import { DiskScheduler } from '../backend/src/core/disk/DiskScheduler.js';
import { PCB } from '../backend/src/types.js';

describe('OS Core Scheduling, Preemption, and Calculations', () => {
  const scheduler = new CPUScheduler();

  it('calculates completion, turnaround, and waiting times accurately with idle intervals', () => {
    // Process arrives at t=2 (CPU idle from 0 to 2)
    const procs: PCB[] = [
      {
        pid: 'P_IDLE_TEST',
        name: 'Idle-Job',
        role: 'Student',
        arrivalTime: 2,
        burstTime: 4,
        remainingTime: 4,
        priority: 1,
        state: 'NEW',
        memoryReq: 64,
        diskReq: 5,
        requiredMachines: [],
        requiredLicenses: [],
        creationTime: 0,
      },
    ];

    const result = scheduler.fcfs(procs);
    expect(result.processes.length).toBe(1);
    const p = result.processes[0];

    // Completion time should be 2 (idle) + 4 (burst) = 6
    expect(p.completionTime).toBe(6);
    // Turnaround = Completion - Arrival = 6 - 2 = 4
    expect(p.turnaroundTime).toBe(4);
    // Waiting = Turnaround - Burst = 4 - 4 = 0
    expect(p.waitingTime).toBe(0);
    // Response time = Start (2) - Arrival (2) = 0
    expect(p.responseTime).toBe(0);

    // Gantt chart should contain an IDLE block from 0 to 2
    expect(result.ganttChart.some(b => b.pid === 'IDLE' && b.startTime === 0 && b.endTime === 2)).toBe(true);
  });

  it('demonstrates priority preemption and decision steps', () => {
    // P1 arrives at 0 with lower priority (3), P2 arrives at 2 with higher priority (1)
    const procs: PCB[] = [
      {
        pid: 'P1',
        name: 'Job1',
        role: 'Student',
        arrivalTime: 0,
        burstTime: 6,
        remainingTime: 6,
        priority: 3,
        state: 'NEW',
        memoryReq: 64,
        diskReq: 5,
        requiredMachines: [],
        requiredLicenses: [],
        creationTime: 0,
      },
      {
        pid: 'P2',
        name: 'Job2_Urgent',
        role: 'Faculty',
        arrivalTime: 2,
        burstTime: 2,
        remainingTime: 2,
        priority: 1,
        state: 'NEW',
        memoryReq: 64,
        diskReq: 5,
        requiredMachines: [],
        requiredLicenses: [],
        creationTime: 2,
      },
    ];

    const res = scheduler.priorityPreemptive(procs, true);
    expect(res.processes.length).toBe(2);

    // P2 should finish before P1 completes because of higher priority (1 < 3)
    const p1 = res.processes.find(p => p.pid === 'P1')!;
    const p2 = res.processes.find(p => p.pid === 'P2')!;
    expect(p2.completionTime).toBe(4); // 2 to 4
    expect(p1.completionTime).toBe(8); // 0-2 (2s), then 4-8 (4s) = 6s total burst

    // Decision steps should be logged
    expect(res.decisionSteps).toBeDefined();
    expect(res.decisionSteps!.length).toBeGreaterThan(0);
  });

  it('mitigates starvation via priority aging', () => {
    // Low priority process in Round Robin with aging
    const procs: PCB[] = [
      {
        pid: 'P_STARVE',
        name: 'Long_Job',
        role: 'Student',
        arrivalTime: 0,
        burstTime: 10,
        remainingTime: 10,
        priority: 5,
        state: 'NEW',
        memoryReq: 64,
        diskReq: 5,
        requiredMachines: [],
        requiredLicenses: [],
        creationTime: 0,
      },
      {
        pid: 'P_ARRIVE',
        name: 'Other_Job',
        role: 'Student',
        arrivalTime: 0,
        burstTime: 10,
        remainingTime: 10,
        priority: 5,
        state: 'NEW',
        memoryReq: 64,
        diskReq: 5,
        requiredMachines: [],
        requiredLicenses: [],
        creationTime: 0,
      },
    ];

    const res = scheduler.roundRobin(procs, 2, true);
    expect(res.processes.length).toBe(2);
    // Both processes should make progress and complete
    expect(res.processes.every(p => p.state === 'TERMINATED')).toBe(true);
  });
});

describe('Process Manager & State Transitions', () => {
  const pm = new ProcessManager();

  it('manages PCB lifecycle and tracks valid state transitions', () => {
    pm.resetSimulation();
    const initialProcesses = pm.getAllProcesses();
    expect(initialProcesses.length).toBeGreaterThan(0);

    // Transition a process to READY using updateState
    const p = initialProcesses[0];
    const readyP = pm.updateState(p.pid, 'READY', 'Admitted to ready queue');
    expect(readyP).toBeDefined();
    expect(readyP.state).toBe('READY');
    expect(readyP.stateHistory).toBeDefined();
    expect(readyP.stateHistory!.length).toBeGreaterThan(0);

    // Transition to RUNNING
    const runningP = pm.updateState(p.pid, 'RUNNING', 'Dispatched by CPU');
    expect(runningP.state).toBe('RUNNING');

    // Discrete step tick
    const tickResult = pm.stepSimulation();
    expect(tickResult).toBeDefined();
    expect(tickResult.clock).toBeGreaterThan(0);
  });
});

describe('Deadlock Engine: Banker Request Validation', () => {
  const deadlock = new DeadlockEngine();

  const baseMatrix = {
    processes: ['P0', 'P1', 'P2'],
    resources: ['R1', 'R2'],
    available: [3, 2],
    max: [
      [3, 2],
      [1, 1],
      [2, 2],
    ],
    allocation: [
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    need: [
      [2, 2],
      [1, 0],
      [1, 1],
    ],
  };

  it('accepts safe resource request and yields a safe sequence', () => {
    // P1 requests [1, 0], which is <= Need [1, 0] and <= Available [3, 2]
    const result = deadlock.validateResourceRequest(baseMatrix, 'P1', [1, 0]);
    expect(result.canGrant).toBe(true);
    expect(result.isSafeState).toBe(true);
    expect(result.safeSequence).toBeDefined();
    expect(result.safeSequence!.length).toBe(3);
  });

  it('rejects resource request exceeding declared maximum need', () => {
    // P1 requests [3, 0], but Need is [1, 0]
    const result = deadlock.validateResourceRequest(baseMatrix, 'P1', [3, 0]);
    expect(result.canGrant).toBe(false);
    expect(result.reason).toContain('exceeds its maximum declared claim');
  });

  it('delays resource request when available resources are insufficient', () => {
    // When available is [1, 1], P0 requests [2, 1] which is <= Need [2, 2] but > Available [1, 1]
    const lowAvailMatrix = {
      ...baseMatrix,
      available: [1, 1],
    };
    const result = deadlock.validateResourceRequest(lowAvailMatrix, 'P0', [2, 1]);
    expect(result.canGrant).toBe(false);
    expect(result.reason).toContain('must wait');
  });

  it('provides comprehensive Coffman deadlock condition explanations', () => {
    const conditions = deadlock.getDeadlockConditionsExplanation();
    expect(conditions.length).toBe(4);
    expect(conditions.some(c => c.condition.includes('Mutual Exclusion'))).toBe(true);
    expect(conditions.some(c => c.condition.includes('Hold and Wait'))).toBe(true);
    expect(conditions.some(c => c.condition.includes('No Preemption'))).toBe(true);
    expect(conditions.some(c => c.condition.includes('Circular Wait'))).toBe(true);
  });
});

describe('Dynamic Memory Allocation & Coalescing', () => {
  const mem = new MemoryManager();

  it('allocates memory and coalesces adjacent free blocks on deallocation', () => {
    // Initialize 1024 MB dynamic memory as clean unseeded block
    mem.resetDynamicMemory(1024, false);
    const initial = mem.getDynamicMemoryState();
    expect(initial.totalMemoryMB).toBe(1024);
    expect(initial.blocks.length).toBe(1);
    expect(initial.blocks[0].isFree).toBe(true);

    // Allocate 200 MB for P1
    const p1Alloc = mem.allocateDynamicProcess('P1', 'Job-1', 200, 'FIRST_FIT');
    expect(p1Alloc.success).toBe(true);
    expect(p1Alloc.allocatedBlockId).toBeDefined();

    // Allocate 300 MB for P2
    const p2Alloc = mem.allocateDynamicProcess('P2', 'Job-2', 300, 'FIRST_FIT');
    expect(p2Alloc.success).toBe(true);

    // Allocate 100 MB for P3
    const p3Alloc = mem.allocateDynamicProcess('P3', 'Job-3', 100, 'FIRST_FIT');
    expect(p3Alloc.success).toBe(true);

    // Deallocate P2 (creates a free hole between P1 and P3)
    const p2Dealloc = mem.deallocateDynamicProcess('P2');
    expect(p2Dealloc.success).toBe(true);

    // Verify external fragmentation: hole of 300 MB + remainder of 424 MB
    const stateWithHole = mem.getDynamicMemoryState();
    expect(stateWithHole.externalFragmentationMB).toBeGreaterThanOrEqual(300);

    // Deallocate P1 (adjacent to P2's free hole -> should coalesce P1 + P2 into 500 MB)
    const p1Dealloc = mem.deallocateDynamicProcess('P1');
    expect(p1Dealloc.success).toBe(true);

    const coalescedState = mem.getDynamicMemoryState();
    const firstBlock = coalescedState.blocks[0];
    expect(firstBlock.isFree).toBe(true);
    expect(firstBlock.size).toBe(500); // 200 + 300 coalesced
  });

  it('fails allocation gracefully when request exceeds largest contiguous free block', () => {
    // Reset memory with seeded fragmentation
    mem.resetDynamicMemory(1024, true);
    // Request 250 MB when total free is 340 MB but largest contiguous is 212 MB -> External Fragmentation failure
    const failedAlloc = mem.allocateDynamicProcess('P_HUGE', 'HugeJob', 250, 'FIRST_FIT');
    expect(failedAlloc.success).toBe(false);
    expect(failedAlloc.reason).toContain('External Fragmentation');
  });
});

describe('Disk Scheduling Validation & Comparison', () => {
  const disk = new DiskScheduler();

  it('validates cylinder inputs within boundary ranges', () => {
    const valid = disk.validateInputs([10, 50, 180], 50, 200);
    expect(valid.valid).toBe(true);

    // Cylinder exceeding disk size
    const invalidCylinder = disk.validateInputs([10, 250], 50, 200);
    expect(invalidCylinder.valid).toBe(false);
    expect(invalidCylinder.error).toContain('outside range');

    // Negative initial head position
    const invalidHead = disk.validateInputs([10, 50], -5, 200);
    expect(invalidHead.valid).toBe(false);
  });

  it('benchmarks all algorithms on the same input queue', () => {
    const queue = [98, 183, 37, 122, 14, 124, 65, 67];
    const comparisonResult = disk.compareAll(queue, 53, 200);
    expect(comparisonResult.comparison.length).toBe(4); // FCFS, SSTF, SCAN, C-SCAN

    const fcfsComp = comparisonResult.comparison.find(c => c.algorithm === 'FCFS')!;
    const sstfComp = comparisonResult.comparison.find(c => c.algorithm === 'SSTF')!;
    expect(fcfsComp.totalHeadMovement).toBe(640);
    expect(sstfComp.totalHeadMovement).toBe(236);

    // All boundary assumptions must be explained
    expect(comparisonResult.boundaryAssumptions.scan.length).toBeGreaterThan(0);
    expect(comparisonResult.boundaryAssumptions.cscan.length).toBeGreaterThan(0);
  });
});
