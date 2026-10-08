import { describe, it, expect } from 'vitest';
import { DeadlockEngine } from '../backend/src/core/deadlock/DeadlockEngine.js';

describe('Deadlock Engine Algorithms', () => {
  const engine = new DeadlockEngine();

  it('detects a SAFE state in Banker Algorithm', () => {
    const safeMatrix = {
      processes: ['P0', 'P1', 'P2'],
      resources: ['A', 'B'],
      available: [3, 3],
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
      need: [],
    };

    const res = engine.runBankersAlgorithm(safeMatrix);
    expect(res.isSafe).toBe(true);
    expect(res.safeSequence.length).toBe(3);
  });

  it('detects an UNSAFE state in Banker Algorithm', () => {
    const unsafeMatrix = {
      processes: ['P0', 'P1'],
      resources: ['A'],
      available: [0],
      max: [[2], [2]],
      allocation: [[1], [1]],
      need: [[1], [1]],
    };

    const res = engine.runBankersAlgorithm(unsafeMatrix);
    expect(res.isSafe).toBe(false);
    expect(res.safeSequence.length).toBe(0);
  });

  it('detects deadlocks and recovers via victim process termination', () => {
    const deadlockedMatrix = {
      processes: ['P1', 'P2'],
      resources: ['R1', 'R2'],
      available: [0, 0],
      max: [
        [1, 1],
        [1, 1],
      ],
      allocation: [
        [1, 0],
        [0, 1],
      ],
      need: [
        [0, 1],
        [1, 0],
      ],
    };

    const detection = engine.detectDeadlock(deadlockedMatrix);
    expect(detection.hasDeadlock).toBe(true);
    expect(detection.deadlockedProcesses.length).toBe(2);

    const recovery = engine.recoverFromDeadlock(deadlockedMatrix);
    expect(recovery.victimProcess).toBeDefined();
    expect(recovery.newIsSafe).toBe(true);
  });
});
