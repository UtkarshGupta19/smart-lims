import { describe, it, expect } from 'vitest';
import { SynchronizationEngine } from '../backend/src/core/sync/SynchronizationEngine.js';

describe('Concurrency & Synchronization Simulation', () => {
  const sync = new SynchronizationEngine();

  it('demonstrates race condition with lost updates vs locked balance', () => {
    const res = sync.runRaceConditionSimulation(100, 5);
    expect(res.withLockFinalBalance).toBe(res.expectedBalance);
    expect(res.noLockFinalBalance).not.toBe(res.expectedBalance);
  });

  it('runs Peterson critical section algorithm trace', () => {
    const steps = sync.runCriticalSectionAlgo('PETERSON');
    expect(steps.length).toBe(5);
    expect(steps[1].processInCS).toBe('P0');
  });

  it('runs Bounded Buffer (Producer-Consumer) step trace', () => {
    const steps = sync.runBoundedBuffer(4, 6);
    expect(steps.length).toBe(6);
  });

  it('runs Dining Philosophers step trace', () => {
    const steps = sync.runDiningPhilosophers(5);
    expect(steps.length).toBe(5);
  });

  it('runs Readers-Writers step trace', () => {
    const steps = sync.runReadersWriters();
    expect(steps.length).toBe(4);
  });

  it('runs Sleeping Barber step trace', () => {
    const steps = sync.runSleepingBarber(3);
    expect(steps.length).toBe(4);
  });
});
