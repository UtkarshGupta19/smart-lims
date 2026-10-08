import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../backend/src/core/simulation/SimulationEngine.js';

describe('Integrated Laboratory OS Simulation Flow', () => {
  const sim = new SimulationEngine();

  it('runs complete lab job workflow end-to-end', () => {
    const res = sim.runIntegratedSimulation({
      jobName: 'Circuit Simulation Test',
      role: 'Student',
      burstTime: 5,
      priority: 2,
      memoryReqMB: 256,
      licenseRequested: 'LIC-MATLAB',
      targetMachine: 'PC-01',
    });

    expect(res.simulationId).toBeDefined();
    expect(res.steps.length).toBeGreaterThanOrEqual(7);
    expect(res.finalMetrics.allocatedMachine).toBe('PC-01');
    expect(res.finalMetrics.allocatedLicense).toBe('LIC-MATLAB');
    expect(res.adaptiveDecision).toBeDefined();
  });
});
