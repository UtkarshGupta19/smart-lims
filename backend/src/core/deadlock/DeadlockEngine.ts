import {
  ResourceMatrix,
  BankerResult,
  CycleDetectionResult,
  DeadlockRecoveryResult,
} from '../../types.js';

export class DeadlockEngine {

  /**
   * Helper to compute Need matrix from Max and Allocation matrices.
   */
  public calculateNeedMatrix(max: number[][], allocation: number[][]): number[][] {
    return max.map((row, i) => row.map((val, j) => Math.max(0, val - allocation[i][j])));
  }

  /**
   * 1. Banker's Algorithm for Deadlock Avoidance & Safe State Detection
   */
  public runBankersAlgorithm(matrix: ResourceMatrix): BankerResult {
    const processes = matrix.processes;
    const numP = processes.length;
    const numR = matrix.resources.length;

    const available = [...matrix.available];
    const allocation = matrix.allocation.map(row => [...row]);
    const max = matrix.max.map(row => [...row]);
    const need = matrix.need && matrix.need.length > 0 ? matrix.need : this.calculateNeedMatrix(max, allocation);

    const work = [...available];
    const finish = new Array(numP).fill(false);
    const safeSequence: string[] = [];
    const stepLogs: string[] = [];

    let count = 0;
    stepLogs.push(`Banker's Algorithm initialized with Available resources: [${available.join(', ')}]`);

    while (count < numP) {
      let found = false;

      for (let i = 0; i < numP; i++) {
        if (!finish[i]) {
          // Check if Need[i] <= Work
          let canExecute = true;
          for (let j = 0; j < numR; j++) {
            if (need[i][j] > work[j]) {
              canExecute = false;
              break;
            }
          }

          if (canExecute) {
            // Allocate work += Allocation[i]
            for (let j = 0; j < numR; j++) {
              work[j] += allocation[i][j];
            }
            finish[i] = true;
            safeSequence.push(processes[i]);
            count++;
            found = true;
            stepLogs.push(
              `Process ${processes[i]} executed safely. Reclaimed resources. New Available Work: [${work.join(', ')}]`
            );
            break;
          }
        }
      }

      if (!found) {
        stepLogs.push(`UNSAFE STATE DETECTED: Unable to find a safe process execution sequence!`);
        break;
      }
    }

    const isSafe = count === numP;

    return {
      isSafe,
      safeSequence: isSafe ? safeSequence : [],
      stepLogs,
      matrixState: {
        processes,
        resources: matrix.resources,
        available,
        max,
        allocation,
        need,
      },
    };
  }

  /**
   * 2. Deadlock Detection using Wait-For Graph (Cycle Detection)
   */
  public detectDeadlock(matrix: ResourceMatrix): CycleDetectionResult {
    const need = matrix.need && matrix.need.length > 0 ? matrix.need : this.calculateNeedMatrix(matrix.max, matrix.allocation);
    const ragEdges: CycleDetectionResult['ragEdges'] = [];
    const waitForGraphEdges: CycleDetectionResult['waitForGraphEdges'] = [];

    // Build RAG edges
    matrix.processes.forEach((p, pIdx) => {
      matrix.resources.forEach((r, rIdx) => {
        if (matrix.allocation[pIdx][rIdx] > 0) {
          ragEdges.push({ from: r, to: p, type: 'ALLOCATED' });
        }
        if (need[pIdx][rIdx] > 0) {
          ragEdges.push({ from: p, to: r, type: 'REQUESTED' });
        }
      });
    });

    // Build Wait-For Graph: If P_A requests R held by P_B, edge P_A -> P_B
    matrix.processes.forEach((pA, i) => {
      matrix.processes.forEach((pB, j) => {
        if (i !== j) {
          matrix.resources.forEach((r, rIdx) => {
            if (need[i][rIdx] > 0 && matrix.allocation[j][rIdx] > 0) {
              waitForGraphEdges.push({ from: pA, to: pB, resource: r });
            }
          });
        }
      });
    });

    // Detect cycles in WFG using DFS
    const adj: Record<string, string[]> = {};
    matrix.processes.forEach(p => (adj[p] = []));
    waitForGraphEdges.forEach((e: { from: string; to: string; resource: string }) => adj[e.from]?.push(e.to));

    const visited: Record<string, boolean> = {};
    const recStack: Record<string, boolean> = {};
    const deadlockedSet = new Set<string>();

    const dfs = (curr: string): boolean => {
      visited[curr] = true;
      recStack[curr] = true;

      for (const neighbor of adj[curr] || []) {
        if (!visited[neighbor]) {
          if (dfs(neighbor)) {
            deadlockedSet.add(curr);
            return true;
          }
        } else if (recStack[neighbor]) {
          deadlockedSet.add(curr);
          deadlockedSet.add(neighbor);
          return true;
        }
      }

      recStack[curr] = false;
      return false;
    };

    matrix.processes.forEach(p => {
      if (!visited[p]) {
        dfs(p);
      }
    });

    const deadlockedProcesses = Array.from(deadlockedSet);

    return {
      hasDeadlock: deadlockedProcesses.length > 0,
      deadlockedProcesses,
      waitForGraphEdges,
      ragEdges,
    };
  }

  /**
   * 3. Deadlock Recovery (Victim process termination & resource reclamation)
   */
  public recoverFromDeadlock(matrix: ResourceMatrix): DeadlockRecoveryResult {
    const detection = this.detectDeadlock(matrix);
    if (!detection.hasDeadlock || detection.deadlockedProcesses.length === 0) {
      return {
        victimProcess: 'None',
        freedResources: {},
        newIsSafe: true,
        recoveryLog: 'No deadlock detected in current system state.',
      };
    }

    // Pick victim process (lowest index / lowest priority)
    const victim = detection.deadlockedProcesses[0];
    const victimIdx = matrix.processes.indexOf(victim);

    const freedResources: Record<string, number> = {};
    const updatedMatrix: ResourceMatrix = {
      processes: matrix.processes.filter(p => p !== victim),
      resources: [...matrix.resources],
      available: [...matrix.available],
      max: matrix.max.filter((_, idx) => idx !== victimIdx),
      allocation: matrix.allocation.filter((_, idx) => idx !== victimIdx),
      need: matrix.need ? matrix.need.filter((_, idx) => idx !== victimIdx) : [],
    };

    matrix.resources.forEach((r, rIdx) => {
      const freed = matrix.allocation[victimIdx][rIdx];
      freedResources[r] = freed;
      updatedMatrix.available[rIdx] += freed;
    });

    const newBanker = this.runBankersAlgorithm(updatedMatrix);

    return {
      victimProcess: victim,
      freedResources,
      newIsSafe: newBanker.isSafe,
      recoveryLog: `Terminated victim process ${victim}. Freed resources: ${JSON.stringify(
        freedResources
      )}. System safe state restored: ${newBanker.isSafe}`,
    };
  }
}

export const deadlockEngine = new DeadlockEngine();
