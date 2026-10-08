import { describe, it, expect } from 'vitest';
import { MemoryManager } from '../backend/src/core/memory/MemoryManager.js';

describe('Memory Manager & Virtual Memory', () => {
  const mem = new MemoryManager();

  it('allocates contiguous partitions using First Fit, Best Fit, and Worst Fit', () => {
    const partitions = [
      { id: 1, size: 100 },
      { id: 2, size: 500 },
      { id: 3, size: 200 },
      { id: 4, size: 300 },
    ];
    const requests = [{ pid: 'P1', size: 212 }];

    const ff = mem.allocateContiguousPartitions(partitions, requests, 'FIRST_FIT');
    expect(ff.allocationMap['P1']).toBe(2);

    const bf = mem.allocateContiguousPartitions(partitions, requests, 'BEST_FIT');
    expect(bf.allocationMap['P1']).toBe(4); // 300 is smallest fit for 212

    const wf = mem.allocateContiguousPartitions(partitions, requests, 'WORST_FIT');
    expect(wf.allocationMap['P1']).toBe(2); // 500 is largest fit
  });

  it('translates logical addresses to physical addresses via Paging', () => {
    const pageTable = [
      { pageNumber: 0, frameNumber: 5, valid: true, referenced: true, modified: false },
      { pageNumber: 1, frameNumber: 2, valid: true, referenced: true, modified: false },
    ];

    const res = mem.translateAddress(4100, 4096, pageTable);
    expect(res.pageNumber).toBe(1);
    expect(res.offset).toBe(4);
    expect(res.physicalAddress).toBe(2 * 4096 + 4);
    expect(res.isPageFault).toBe(false);
  });

  it('executes Page Replacement algorithms (FIFO, LRU, Optimal, LFU)', () => {
    const refSeq = [7, 0, 1, 2, 0, 3, 0, 4];
    const fifo = mem.runPageReplacement(refSeq, 3, 'FIFO');
    expect(fifo.pageFaultCount).toBeGreaterThan(0);

    const lru = mem.runPageReplacement(refSeq, 3, 'LRU');
    expect(lru.pageFaultCount).toBeGreaterThan(0);

    const opt = mem.runPageReplacement(refSeq, 3, 'OPTIMAL');
    expect(opt.pageFaultCount).toBeLessThanOrEqual(fifo.pageFaultCount);
  });

  it("demonstrates Belady's Anomaly correctly", () => {
    const belady = mem.runBeladyAnomaly();
    expect(belady.anomalyDetected).toBe(true);
    expect(belady.frame4Faults).toBeGreaterThan(belady.frame3Faults);
  });
});
