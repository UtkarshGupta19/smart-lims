import {
  MemoryPartition,
  PartitionAllocationResult,
  PageTableEntry,
  PageReplacementResult,
  PageReplacementStep,
  BeladyResult,
} from '../../types.js';

export class MemoryManager {

  /**
   * 1. Contiguous Memory Partition Allocation (First Fit, Best Fit, Worst Fit)
   */
  public allocateContiguousPartitions(
    initialPartitions: Array<{ id: number; size: number }>,
    processRequests: Array<{ pid: string; size: number }>,
    algo: 'FIRST_FIT' | 'BEST_FIT' | 'WORST_FIT'
  ): PartitionAllocationResult {
    const partitions: MemoryPartition[] = initialPartitions.map(p => ({
      ...p,
      allocatedProcessId: null,
      internalFragmentation: 0,
    }));

    const allocationMap: Record<string, number> = {};
    const unallocatedProcesses: string[] = [];

    processRequests.forEach(proc => {
      let targetIdx = -1;

      const eligibleIndices = partitions
        .map((p, idx) => ({ ...p, idx }))
        .filter(p => p.allocatedProcessId === null && p.size >= proc.size);

      if (eligibleIndices.length > 0) {
        if (algo === 'FIRST_FIT') {
          targetIdx = eligibleIndices[0].idx;
        } else if (algo === 'BEST_FIT') {
          eligibleIndices.sort((a, b) => a.size - b.size);
          targetIdx = eligibleIndices[0].idx;
        } else if (algo === 'WORST_FIT') {
          eligibleIndices.sort((a, b) => b.size - a.size);
          targetIdx = eligibleIndices[0].idx;
        }
      }

      if (targetIdx !== -1) {
        partitions[targetIdx].allocatedProcessId = proc.pid;
        partitions[targetIdx].internalFragmentation = partitions[targetIdx].size - proc.size;
        allocationMap[proc.pid] = partitions[targetIdx].id;
      } else {
        unallocatedProcesses.push(proc.pid);
      }
    });

    const totalInternalFragmentation = partitions.reduce((sum, p) => sum + p.internalFragmentation, 0);
    const totalExternalFragmentation = partitions
      .filter(p => p.allocatedProcessId === null)
      .reduce((sum, p) => sum + p.size, 0);

    return {
      partitions,
      unallocatedProcesses,
      totalInternalFragmentation,
      totalExternalFragmentation,
      allocationMap,
    };
  }

  /**
   * 2. Paging System & Logical Address Translation
   */
  public translateAddress(
    logicalAddress: number,
    pageSizeBytes: number = 4096,
    pageTable: PageTableEntry[]
  ): {
    logicalAddress: number;
    pageNumber: number;
    offset: number;
    physicalAddress: number | null;
    isPageFault: boolean;
  } {
    const pageNumber = Math.floor(logicalAddress / pageSizeBytes);
    const offset = logicalAddress % pageSizeBytes;

    const entry = pageTable[pageNumber];
    if (!entry || !entry.valid || entry.frameNumber === null) {
      return {
        logicalAddress,
        pageNumber,
        offset,
        physicalAddress: null,
        isPageFault: true,
      };
    }

    const physicalAddress = entry.frameNumber * pageSizeBytes + offset;
    return {
      logicalAddress,
      pageNumber,
      offset,
      physicalAddress,
      isPageFault: false,
    };
  }

  /**
   * 3. Page Replacement Algorithms (FIFO, LRU, Optimal, LFU)
   */
  public runPageReplacement(
    referenceString: number[],
    frameCount: number = 3,
    algo: 'FIFO' | 'LRU' | 'OPTIMAL' | 'LFU'
  ): PageReplacementResult {
    const frames: (number | null)[] = new Array(frameCount).fill(null);
    const steps: PageReplacementStep[] = [];
    let pageFaultCount = 0;
    let hitCount = 0;

    // Trackers
    const fifoQueue: number[] = [];
    const lastUsedMap = new Map<number, number>();
    const frequencyMap = new Map<number, number>();

    referenceString.forEach((page, index) => {
      let isPageFault = false;
      let evictedPage: number | null = null;

      // Update frequency
      frequencyMap.set(page, (frequencyMap.get(page) || 0) + 1);

      if (frames.includes(page)) {
        // Page Hit!
        hitCount++;
        lastUsedMap.set(page, index);
      } else {
        // Page Fault!
        pageFaultCount++;
        isPageFault = true;

        if (frames.includes(null)) {
          // Free frame available
          const freeIdx = frames.indexOf(null);
          frames[freeIdx] = page;
          fifoQueue.push(page);
          lastUsedMap.set(page, index);
        } else {
          // Frame replacement needed
          let victim = frames[0]!;

          if (algo === 'FIFO') {
            victim = fifoQueue.shift()!;
          } else if (algo === 'LRU') {
            let minIndex = Infinity;
            frames.forEach(f => {
              const lastUsed = lastUsedMap.get(f!) ?? -1;
              if (lastUsed < minIndex) {
                minIndex = lastUsed;
                victim = f!;
              }
            });
          } else if (algo === 'OPTIMAL') {
            let farthest = -1;
            frames.forEach(f => {
              const nextUse = referenceString.slice(index + 1).indexOf(f!);
              if (nextUse === -1) {
                farthest = Infinity;
                victim = f!;
              } else if (nextUse > farthest) {
                farthest = nextUse;
                victim = f!;
              }
            });
          } else if (algo === 'LFU') {
            let minFreq = Infinity;
            frames.forEach(f => {
              const freq = frequencyMap.get(f!) || 0;
              if (freq < minFreq) {
                minFreq = freq;
                victim = f!;
              }
            });
          }

          evictedPage = victim;
          const replaceIdx = frames.indexOf(victim);
          frames[replaceIdx] = page;

          // Update FIFO queue
          const fifoIdx = fifoQueue.indexOf(victim);
          if (fifoIdx !== -1) fifoQueue.splice(fifoIdx, 1);
          fifoQueue.push(page);

          lastUsedMap.set(page, index);
        }
      }

      steps.push({
        step: index + 1,
        pageRequested: page,
        frames: [...frames],
        isPageFault,
        evictedPage,
      });
    });

    const pageFaultRate = Number(((pageFaultCount / referenceString.length) * 100).toFixed(2));

    return {
      algorithm: algo,
      referenceString,
      frameCount,
      pageFaultCount,
      pageFaultRate,
      hitCount,
      steps,
    };
  }

  /**
   * 4. Belady's Anomaly Demonstration
   * Reference sequence: 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5
   * Under FIFO, frame count=3 gives 9 faults, while frame count=4 gives 10 faults!
   */
  public runBeladyAnomaly(): BeladyResult {
    const refSeq = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];
    const res3 = this.runPageReplacement(refSeq, 3, 'FIFO');
    const res4 = this.runPageReplacement(refSeq, 4, 'FIFO');

    const anomalyDetected = res4.pageFaultCount > res3.pageFaultCount;

    return {
      referenceString: refSeq,
      frame3Faults: res3.pageFaultCount,
      frame4Faults: res4.pageFaultCount,
      anomalyDetected,
      explanation: `FIFO Page Faults with 3 Frames: ${res3.pageFaultCount} | FIFO Page Faults with 4 Frames: ${res4.pageFaultCount}. Increasing memory frames increased page fault rate (Belady's Anomaly)!`,
    };
  }

  /**
   * 5. Thrashing Detection
   */
  public detectThrashing(pageFaultRatePercent: number, cpuUtilizationPercent: number): {
    isThrashing: boolean;
    recommendation: string;
  } {
    if (pageFaultRatePercent > 70 && cpuUtilizationPercent < 30) {
      return {
        isThrashing: true,
        recommendation:
          'CRITICAL: System is Thrashing! Processes spend more time paging than executing. Mid-Term Scheduler must swap out lower priority processes immediately.',
      };
    }
    return {
      isThrashing: false,
      recommendation: 'System memory pressure is within acceptable limits.',
    };
  }
}

export const memoryManager = new MemoryManager();
