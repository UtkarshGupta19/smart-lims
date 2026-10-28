import {
  ResourceMatrix,
  BankerResult,
  BankerRequestValidationResult,
  CycleDetectionResult,
  DeadlockRecoveryResult,
} from '../../types.js';

export class DeadlockEngine {

  /**
   * Educational explanation of Coffman's 4 Necessary Deadlock Conditions in Lab Context
   */
  public getDeadlockConditionsExplanation(): Array<{ condition: string; explanation: string; labExample: string; prevention: string }> {
    return [
      {
        condition: '1. Mutual Exclusion',
        explanation: 'At least one resource must be held in a non-shareable mode. Only one process can use the resource at any given time.',
        labExample: 'Workstation Alpha (PC-01) or a single-seat Cadence EDA license can only be actively used by one student at a time.',
        prevention: 'Spooling or virtualization (virtual machines / license pooling) so resources can appear shareable.',
      },
      {
        condition: '2. Hold and Wait',
        explanation: 'A process must be currently holding at least one resource and requesting additional resources that are held by other processes.',
        labExample: 'Student 1 holds Workstation PC-01 and waits for MATLAB license; Student 2 holds MATLAB license and waits for ANSYS.',
        prevention: 'Require processes to declare and request all required resources at once before starting execution.',
      },
      {
        condition: '3. No Preemption',
        explanation: 'Resources cannot be forcibly confiscated from a process; they can only be released voluntarily after the process completes its task.',
        labExample: 'The lab operating system does not forcefully terminate a long-running simulation job or revoke its workstation.',
        prevention: 'If a process requests a resource that is unavailable, all currently held resources are preempted and returned to the pool.',
      },
      {
        condition: '4. Circular Wait',
        explanation: 'A closed chain of processes exists such that each process holds a resource that is needed by the next process in the chain.',
        labExample: 'P1 holds PC-01 and waits for MATLAB (held by P2); P2 holds MATLAB and waits for PC-01 (held by P1). Neither can proceed.',
        prevention: 'Impose a strict global numerical ordering on all lab resources (e.g., PC-01 = 1, MATLAB = 2) and require monotonic acquisition.',
      },
    ];
  }

  /**
   * Banker's Resource-Request Algorithm:
   * Decides whether an immediate resource request by process `pid` can be safely granted.
   */
  public validateResourceRequest(
    matrix: ResourceMatrix,
    pid: string,
    request: number[]
  ): BankerRequestValidationResult {
    const pIdx = matrix.processes.indexOf(pid);
    const stepLogs: string[] = [];

    if (pIdx === -1) {
      return {
        pid,
        request,
        canGrant: false,
        isSafeState: false,
        reason: `Process ${pid} is not registered in the resource allocation state.`,
        stepLogs: [`Process ${pid} not found.`],
      };
    }

    const numR = matrix.resources.length;
    const need = matrix.need && matrix.need.length > 0 ? matrix.need : this.calculateNeedMatrix(matrix.max, matrix.allocation);

    stepLogs.push(`Evaluating request from ${pid}: [${request.join(', ')}] for resources [${matrix.resources.join(', ')}]`);

    // Step 1: Check if Request <= Need
    for (let j = 0; j < numR; j++) {
      if (request[j] > need[pIdx][j]) {
        const reason = `Error: Process ${pid} requested ${request[j]} of ${matrix.resources[j]}, which exceeds its maximum declared claim (Need: ${need[pIdx][j]}).`;
        stepLogs.push(reason);
        return {
          pid,
          request,
          canGrant: false,
          isSafeState: false,
          reason,
          stepLogs,
        };
      }
    }
    stepLogs.push(`Check 1 Passed: Request <= Need (Process is within its declared maximum demand).`);

    // Step 2: Check if Request <= Available
    for (let j = 0; j < numR; j++) {
      if (request[j] > matrix.available[j]) {
        const reason = `Delay: Process ${pid} must wait. Requested ${request[j]} of ${matrix.resources[j]}, but only ${matrix.available[j]} is currently available.`;
        stepLogs.push(reason);
        return {
          pid,
          request,
          canGrant: false,
          isSafeState: false,
          reason,
          stepLogs,
        };
      }
    }
    stepLogs.push(`Check 2 Passed: Request <= Available (Sufficient resources exist to satisfy request).`);

    // Step 3: Tentatively allocate resources and check safety
    const tentativeAvailable = [...matrix.available];
    const tentativeAllocation = matrix.allocation.map(row => [...row]);
    const tentativeNeed = need.map(row => [...row]);

    for (let j = 0; j < numR; j++) {
      tentativeAvailable[j] -= request[j];
      tentativeAllocation[pIdx][j] += request[j];
      tentativeNeed[pIdx][j] -= request[j];
    }

    stepLogs.push(`Hypothetical Allocation: Tentative Available = [${tentativeAvailable.join(', ')}]`);

    const tentativeMatrix: ResourceMatrix = {
      processes: [...matrix.processes],
      resources: [...matrix.resources],
      available: tentativeAvailable,
      max: matrix.max.map(r => [...r]),
      allocation: tentativeAllocation,
      need: tentativeNeed,
    };

    const safetyResult = this.runBankersAlgorithm(tentativeMatrix);

    if (safetyResult.isSafe) {
      stepLogs.push(`Check 3 Passed: Safe sequence found -> ${safetyResult.safeSequence.join(' ➜ ')}`);
      return {
        pid,
        request,
        canGrant: true,
        isSafeState: true,
        safeSequence: safetyResult.safeSequence,
        reason: `SAFE: Request granted! System remains in a safe state with execution sequence: ${safetyResult.safeSequence.join(' ➜ ')}.`,
        stepLogs,
      };
    } else {
      stepLogs.push(`Check 3 FAILED: Granting request leads to an UNSAFE STATE! No safe execution sequence exists.`);
      return {
        pid,
        request,
        canGrant: false,
        isSafeState: false,
        reason: `UNSAFE: Request rejected by Banker's Algorithm. Granting would create circular wait vulnerability and deadlock risk.`,
        stepLogs,
      };
    }
  }


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
