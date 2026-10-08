import { ThreadInfo, ThreadModel, BackgroundWorkerStatus } from '../../types.js';

export class ThreadEngine {
  private threads: Map<string, ThreadInfo> = new Map();
  private workers: BackgroundWorkerStatus[] = [
    {
      id: 'worker-1',
      name: 'System Monitoring Worker',
      type: 'MONITORING',
      status: 'ACTIVE',
      lastRun: new Date().toISOString(),
      executionCount: 142,
      threadCount: 2,
    },
    {
      id: 'worker-2',
      name: 'Audit Logging Worker',
      type: 'LOGGING',
      status: 'ACTIVE',
      lastRun: new Date().toISOString(),
      executionCount: 89,
      threadCount: 1,
    },
    {
      id: 'worker-3',
      name: 'Automated DB Backup Worker',
      type: 'BACKUP',
      status: 'IDLE',
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      executionCount: 24,
      threadCount: 4,
    },
    {
      id: 'worker-4',
      name: 'Lab Health Check Worker',
      type: 'HEALTH_CHECK',
      status: 'ACTIVE',
      lastRun: new Date().toISOString(),
      executionCount: 310,
      threadCount: 2,
    },
  ];

  constructor() {
    this.seedThreads();
  }

  private seedThreads(): void {
    const sampleThreads: ThreadInfo[] = [
      { tid: 'T101', pid: 'P1', name: 'UI Rendering Thread', state: 'RUNNING', userThreadId: 'UT-1', kernelThreadId: 'KT-1', stackSizeKB: 64, cpuShare: 35 },
      { tid: 'T102', pid: 'P1', name: 'Network Listener Thread', state: 'RUNNABLE', userThreadId: 'UT-2', kernelThreadId: 'KT-1', stackSizeKB: 32, cpuShare: 15 },
      { tid: 'T103', pid: 'P2', name: 'MATLAB Calculation Worker', state: 'RUNNING', userThreadId: 'UT-3', kernelThreadId: 'KT-2', stackSizeKB: 128, cpuShare: 80 },
      { tid: 'T104', pid: 'P2', name: 'File Auto-save Thread', state: 'BLOCKED', userThreadId: 'UT-4', kernelThreadId: 'KT-3', stackSizeKB: 64, cpuShare: 5 },
      { tid: 'T105', pid: 'P3', name: 'Database Query Executor', state: 'RUNNABLE', userThreadId: 'UT-5', kernelThreadId: 'KT-4', stackSizeKB: 64, cpuShare: 20 },
    ];
    sampleThreads.forEach(t => this.threads.set(t.tid, t));
  }

  public getThreads(): ThreadInfo[] {
    return Array.from(this.threads.values());
  }

  public getBackgroundWorkers(): BackgroundWorkerStatus[] {
    return this.workers.map(w => ({
      ...w,
      executionCount: w.status === 'ACTIVE' ? w.executionCount + Math.floor(Math.random() * 3) : w.executionCount,
      lastRun: w.status === 'ACTIVE' ? new Date().toISOString() : w.lastRun,
    }));
  }

  public simulateModelMapping(model: ThreadModel, userThreadCount: number, kernelThreadCount: number): {
    model: ThreadModel;
    userThreads: string[];
    kernelThreads: string[];
    mappings: Array<{ userThread: string; kernelThread: string }>;
    description: string;
  } {
    const userThreads = Array.from({ length: userThreadCount }, (_, i) => `UT-${i + 1}`);
    const kernelThreads = Array.from({ length: kernelThreadCount }, (_, i) => `KT-${i + 1}`);
    const mappings: Array<{ userThread: string; kernelThread: string }> = [];
    let description = '';

    if (model === 'MANY_TO_ONE') {
      const kt = kernelThreads[0] || 'KT-1';
      userThreads.forEach(ut => mappings.push({ userThread: ut, kernelThread: kt }));
      description = 'Many user-level threads mapped to a single kernel thread. Fast context switching, but blocks all threads if one blocks.';
    } else if (model === 'ONE_TO_ONE') {
      userThreads.forEach((ut, i) => {
        const kt = kernelThreads[i] || `KT-${i + 1}`;
        mappings.push({ userThread: ut, kernelThread: kt });
      });
      description = 'Each user thread maps to a dedicated kernel thread. Full concurrency on multi-core systems, but higher thread creation overhead.';
    } else {
      userThreads.forEach((ut, i) => {
        const kt = kernelThreads[i % kernelThreads.length];
        mappings.push({ userThread: ut, kernelThread: kt });
      });
      description = 'Multiplexes many user-level threads to a smaller/equal number of kernel threads. Optimal balance of concurrency and overhead.';
    }

    return { model, userThreads, kernelThreads, mappings, description };
  }
}

export const threadEngine = new ThreadEngine();
