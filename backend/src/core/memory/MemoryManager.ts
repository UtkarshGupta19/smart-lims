import {
  MemoryPartition,
  PartitionAllocationResult,
  DynamicMemoryBlock,
  DynamicMemoryState,
  PageTableEntry,
  PageReplacementResult,
  PageReplacementStep,
  BeladyResult,
} from '../../types.js';

export class MemoryManager {
  private totalMemoryMB: number = 1024;
  private dynamicBlocks: DynamicMemoryBlock[] = [];
  private blockIdCounter = 1;

  constructor() {
    this.resetDynamicMemory(1024);
  }

  /**
   * Reset dynamic memory to an initial single free block or seeded sample state
   */
  public resetDynamicMemory(totalMB: number = 1024, seeded: boolean = true): DynamicMemoryState {
    this.totalMemoryMB = Math.max(128, totalMB);
    this.blockIdCounter = 1;

    if (!seeded) {
      this.dynamicBlocks = [
        {
          id: `BLK-${this.blockIdCounter++}`,
          startAddress: 0,
          size: this.totalMemoryMB,
          isFree: true,
          pid: null,
          processName: null,
        },
      ];
    } else {
      // Seed a realistic college lab memory layout with sample processes and free blocks
      this.dynamicBlocks = [
        { id: 'BLK-1', startAddress: 0, size: 128, isFree: false, pid: 'OS-KERNEL', processName: 'Lab Kernel Services' },
        { id: 'BLK-2', startAddress: 128, size: 256, isFree: false, pid: 'P1', processName: 'MATLAB Simulation' },
        { id: 'BLK-3', startAddress: 384, size: 128, isFree: true, pid: null, processName: null },
        { id: 'BLK-4', startAddress: 512, size: 300, isFree: false, pid: 'P2', processName: 'ANSYS FEA Model' },
        { id: 'BLK-5', startAddress: 812, size: 212, isFree: true, pid: null, processName: null },
      ];
    }

    return this.getDynamicMemoryState();
  }

  public getDynamicMemoryState(): DynamicMemoryState {
    let allocatedMB = 0;
    let freeMB = 0;
    let largestFree = 0;

    this.dynamicBlocks.forEach(b => {
      if (b.isFree) {
        freeMB += b.size;
        if (b.size > largestFree) largestFree = b.size;
      } else {
        allocatedMB += b.size;
      }
    });

    // External fragmentation is free space that is split into pieces smaller than total free
    const externalFrag = freeMB > largestFree ? freeMB - largestFree : 0;

    return {
      totalMemoryMB: this.totalMemoryMB,
      allocatedMemoryMB: allocatedMB,
      freeMemoryMB: freeMB,
      blocks: this.dynamicBlocks.map(b => ({ ...b })),
      largestFreeBlockMB: largestFree,
      externalFragmentationMB: externalFrag,
    };
  }

  /**
   * Dynamic process allocation using First Fit, Best Fit, or Worst Fit
   */
  public allocateDynamicProcess(
    pid: string,
    processName: string,
    sizeMB: number,
    strategy: 'FIRST_FIT' | 'BEST_FIT' | 'WORST_FIT'
  ): { success: boolean; reason: string; memoryState: DynamicMemoryState; allocatedBlockId?: string } {
    if (sizeMB <= 0) {
      return {
        success: false,
        reason: 'Invalid memory size: Requested size must be greater than 0 MB.',
        memoryState: this.getDynamicMemoryState(),
      };
    }

    const freeBlocksWithIndices = this.dynamicBlocks
      .map((b, idx) => ({ block: b, index: idx }))
      .filter(item => item.block.isFree && item.block.size >= sizeMB);

    if (freeBlocksWithIndices.length === 0) {
      const currentState = this.getDynamicMemoryState();
      let reason: string;

      if (currentState.freeMemoryMB >= sizeMB) {
        reason = `Allocation Failure (External Fragmentation): System has ${currentState.freeMemoryMB} MB total free memory, but the largest contiguous free block is only ${currentState.largestFreeBlockMB} MB. Process ${pid} requires ${sizeMB} MB contiguous space.`;
      } else {
        reason = `Allocation Failure (Out of Memory): Insufficient free space. Requested ${sizeMB} MB, but only ${currentState.freeMemoryMB} MB is free.`;
      }

      return {
        success: false,
        reason,
        memoryState: currentState,
      };
    }

    // Pick block according to strategy
    let chosenIndex = -1;
    if (strategy === 'FIRST_FIT') {
      chosenIndex = freeBlocksWithIndices[0].index;
    } else if (strategy === 'BEST_FIT') {
      freeBlocksWithIndices.sort((a, b) => (a.block.size - sizeMB) - (b.block.size - sizeMB));
      chosenIndex = freeBlocksWithIndices[0].index;
    } else if (strategy === 'WORST_FIT') {
      freeBlocksWithIndices.sort((a, b) => (b.block.size - sizeMB) - (a.block.size - sizeMB));
      chosenIndex = freeBlocksWithIndices[0].index;
    }

    const targetBlock = this.dynamicBlocks[chosenIndex];
    const originalSize = targetBlock.size;
    const remainder = originalSize - sizeMB;
    const allocatedId = `BLK-${this.blockIdCounter++}`;

    // Split block
    const allocatedBlock: DynamicMemoryBlock = {
      id: allocatedId,
      startAddress: targetBlock.startAddress,
      size: sizeMB,
      isFree: false,
      pid,
      processName,
    };

    if (remainder > 0) {
      const remainderBlock: DynamicMemoryBlock = {
        id: `BLK-${this.blockIdCounter++}`,
        startAddress: targetBlock.startAddress + sizeMB,
        size: remainder,
        isFree: true,
        pid: null,
        processName: null,
      };
      this.dynamicBlocks.splice(chosenIndex, 1, allocatedBlock, remainderBlock);
    } else {
      this.dynamicBlocks.splice(chosenIndex, 1, allocatedBlock);
    }

    const state = this.getDynamicMemoryState();
    return {
      success: true,
      reason: `Successfully allocated ${sizeMB} MB to Process ${pid} (${processName}) at address [${allocatedBlock.startAddress} - ${allocatedBlock.startAddress + sizeMB} MB] using ${strategy.replace('_', ' ')}.`,
      memoryState: state,
      allocatedBlockId: allocatedId,
    };
  }

  /**
   * Deallocate process and automatically coalesce adjacent free blocks
   */
  public deallocateDynamicProcess(pidOrBlockId: string): { success: boolean; reason: string; memoryState: DynamicMemoryState } {
    const targetIdx = this.dynamicBlocks.findIndex(
      b => !b.isFree && (b.pid === pidOrBlockId || b.id === pidOrBlockId)
    );

    if (targetIdx === -1) {
      return {
        success: false,
        reason: `Process or block '${pidOrBlockId}' not found among allocated blocks.`,
        memoryState: this.getDynamicMemoryState(),
      };
    }

    const target = this.dynamicBlocks[targetIdx];
    const freedPid = target.pid;
    const freedSize = target.size;

    target.isFree = true;
    target.pid = null;
    target.processName = null;

    // Coalesce adjacent free blocks
    const newBlocks: DynamicMemoryBlock[] = [];
    for (let i = 0; i < this.dynamicBlocks.length; i++) {
      const curr = this.dynamicBlocks[i];
      if (newBlocks.length > 0 && newBlocks[newBlocks.length - 1].isFree && curr.isFree) {
        // Merge with previous
        const prev = newBlocks[newBlocks.length - 1];
        prev.size += curr.size;
      } else {
        newBlocks.push(curr);
      }
    }
    this.dynamicBlocks = newBlocks;

    return {
      success: true,
      reason: `Deallocated ${freedSize} MB from ${freedPid}. Contiguous free blocks coalesced.`,
      memoryState: this.getDynamicMemoryState(),
    };
  }


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
