import { describe, it, expect } from 'vitest';
import { DiskScheduler } from '../backend/src/core/disk/DiskScheduler.js';

describe('Disk Scheduling Algorithms', () => {
  const disk = new DiskScheduler();
  const queue = [98, 183, 37, 122, 14, 124, 65, 67];
  const head = 53;

  it('calculates FCFS total head movement correctly', () => {
    const res = disk.fcfs(queue, head);
    expect(res.seekSequence.length).toBe(queue.length + 1);
    expect(res.totalHeadMovement).toBe(640);
  });

  it('calculates SSTF total head movement correctly', () => {
    const res = disk.sstf(queue, head);
    expect(res.totalHeadMovement).toBe(236);
  });

  it('executes SCAN, C-SCAN, LOOK, C-LOOK without errors', () => {
    const scan = disk.scan(queue, head);
    expect(scan.totalHeadMovement).toBeGreaterThan(0);

    const cscan = disk.cscan(queue, head);
    expect(cscan.totalHeadMovement).toBeGreaterThan(0);

    const look = disk.look(queue, head);
    expect(look.totalHeadMovement).toBeGreaterThan(0);

    const clook = disk.clook(queue, head);
    expect(clook.totalHeadMovement).toBeGreaterThan(0);
  });
});
