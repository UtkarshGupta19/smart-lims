import {
  RaceConditionSimResult,
  CriticalSectionStep,
  BoundedBufferStep,
  DiningPhilosophersStep,
  ReadersWritersStep,
  SleepingBarberStep,
} from '../../types.js';

export class SynchronizationEngine {

  /**
   * 1. Race Condition Simulation
   * Simulates concurrent updates to a shared lab account/resource quota without vs with mutex locks.
   */
  public runRaceConditionSimulation(initialBalance: number = 100, iterations: number = 5): RaceConditionSimResult {
    let noLockVal = initialBalance;
    let withLockVal = initialBalance;
    const stepTrace: RaceConditionSimResult['stepTrace'] = [];

    for (let i = 1; i <= iterations; i++) {
      // Thread A reads & modifies
      const tA_readNoLock = noLockVal;
      const tA_readWithLock = withLockVal;

      // Thread B reads concurrently before Thread A writes back (No Lock scenario)
      const tB_readNoLock = tA_readNoLock;

      // Thread A adds 50
      const tA_writeNoLock = tA_readNoLock + 50;
      noLockVal = tA_writeNoLock;

      withLockVal += 50; // With lock: sequential atomic addition

      stepTrace.push({
        step: i * 2 - 1,
        threadId: 'Thread-A (Student-1)',
        action: 'Deposited 50 lab points',
        noLockValue: noLockVal,
        withLockValue: withLockVal,
      });

      // Thread B subtracts 30 using stale read value
      const tB_writeNoLock = tB_readNoLock - 30; // Lost update!
      noLockVal = tB_writeNoLock;

      withLockVal -= 30; // With lock: sequential atomic subtraction

      stepTrace.push({
        step: i * 2,
        threadId: 'Thread-B (Student-2)',
        action: 'Deducted 30 lab points (Conflict!)',
        noLockValue: noLockVal,
        withLockValue: withLockVal,
      });
    }

    const expectedBalance = initialBalance + iterations * (50 - 30);

    return {
      noLockFinalBalance: noLockVal,
      withLockFinalBalance: withLockVal,
      expectedBalance,
      stepTrace,
    };
  }

  /**
   * 2. Critical Section Algorithm Simulation
   */
  public runCriticalSectionAlgo(algoName: string): CriticalSectionStep[] {
    const steps: CriticalSectionStep[] = [];

    if (algoName === 'PETERSON') {
      let turn = 0;
      let flag = [false, false];

      steps.push({
        step: 1,
        algorithm: "Peterson's Solution",
        processInCS: null,
        waitingQueue: [],
        lockState: { turn: 0, flag: [false, false] },
        log: 'Initial State: Both processes P0 and P1 idle.',
      });

      // P0 wants to enter
      flag[0] = true;
      turn = 1;
      steps.push({
        step: 2,
        algorithm: "Peterson's Solution",
        processInCS: 'P0',
        waitingQueue: [],
        lockState: { turn, flag: [...flag] },
        log: 'P0 sets flag[0]=true, yields turn=1. P0 enters Critical Section.',
      });

      // P1 wants to enter while P0 is in CS
      flag[1] = true;
      turn = 0;
      steps.push({
        step: 3,
        algorithm: "Peterson's Solution",
        processInCS: 'P0',
        waitingQueue: ['P1'],
        lockState: { turn, flag: [...flag] },
        log: 'P1 sets flag[1]=true, turn=0. P1 busy waits because P0 is in CS.',
      });

      // P0 leaves CS
      flag[0] = false;
      steps.push({
        step: 4,
        algorithm: "Peterson's Solution",
        processInCS: 'P1',
        waitingQueue: [],
        lockState: { turn, flag: [...flag] },
        log: 'P0 sets flag[0]=false. P1 exits busy wait and enters CS.',
      });

      // P1 leaves CS
      flag[1] = false;
      steps.push({
        step: 5,
        algorithm: "Peterson's Solution",
        processInCS: null,
        waitingQueue: [],
        lockState: { turn, flag: [...flag] },
        log: 'P1 leaves Critical Section. Mutual Exclusion and Bounded Waiting preserved.',
      });
    } else if (algoName === 'TEST_AND_SET') {
      let lock = false;
      steps.push({ step: 1, algorithm: 'Test-and-Set Lock', processInCS: null, waitingQueue: [], lockState: { lock }, log: 'Lock initially false.' });

      // P1 acquires lock
      lock = true;
      steps.push({ step: 2, algorithm: 'Test-and-Set Lock', processInCS: 'P1', waitingQueue: [], lockState: { lock }, log: 'P1 executes TestAndSet(&lock) -> returned false, lock set to true. P1 in CS.' });

      // P2 attempts acquire
      steps.push({ step: 3, algorithm: 'Test-and-Set Lock', processInCS: 'P1', waitingQueue: ['P2'], lockState: { lock }, log: 'P2 executes TestAndSet(&lock) -> returned true, P2 spins in while loop.' });

      // P1 releases
      lock = false;
      steps.push({ step: 4, algorithm: 'Test-and-Set Lock', processInCS: 'P2', waitingQueue: [], lockState: { lock: true }, log: 'P1 sets lock=false. P2 acquires lock and enters CS.' });
    } else {
      // Binary / Counting Semaphore default
      steps.push({ step: 1, algorithm: 'Counting Semaphore (S=2)', processInCS: null, waitingQueue: [], lockState: { value: 2 }, log: 'Semaphore initialized to 2.' });
      steps.push({ step: 2, algorithm: 'Counting Semaphore (S=2)', processInCS: 'P1', waitingQueue: [], lockState: { value: 1 }, log: 'P1 calls wait(S). Value=1. P1 granted resource.' });
      steps.push({ step: 3, algorithm: 'Counting Semaphore (S=2)', processInCS: 'P1, P2', waitingQueue: [], lockState: { value: 0 }, log: 'P2 calls wait(S). Value=0. P2 granted resource.' });
      steps.push({ step: 4, algorithm: 'Counting Semaphore (S=2)', processInCS: 'P1, P2', waitingQueue: ['P3'], lockState: { value: -1 }, log: 'P3 calls wait(S). Value=-1. P3 blocked in queue.' });
      steps.push({ step: 5, algorithm: 'Counting Semaphore (S=2)', processInCS: 'P2, P3', waitingQueue: [], lockState: { value: 0 }, log: 'P1 calls signal(S). P3 unblocked and enters CS.' });
    }

    return steps;
  }

  /**
   * 3. Bounded Buffer (Producer-Consumer)
   */
  public runBoundedBuffer(bufferCapacity: number = 4, stepsCount: number = 6): BoundedBufferStep[] {
    const steps: BoundedBufferStep[] = [];
    const buffer: string[] = [];
    let inIndex = 0;
    let outIndex = 0;
    let mutex = true;
    let emptySem = bufferCapacity;
    let fullSem = 0;
    let itemCounter = 1;

    for (let i = 1; i <= stepsCount; i++) {
      const isProducer = i % 2 !== 0;

      if (isProducer) {
        if (emptySem > 0 && mutex) {
          const item = `LabData-${itemCounter++}`;
          buffer.push(item);
          emptySem--;
          fullSem++;
          inIndex = (inIndex + 1) % bufferCapacity;
          steps.push({
            step: i,
            action: 'PRODUCE',
            item,
            buffer: [...buffer],
            bufferSize: bufferCapacity,
            inIndex,
            outIndex,
            mutexState: true,
            emptySem,
            fullSem,
          });
        } else {
          steps.push({
            step: i,
            action: 'BLOCKED_FULL',
            buffer: [...buffer],
            bufferSize: bufferCapacity,
            inIndex,
            outIndex,
            mutexState: false,
            emptySem,
            fullSem,
          });
        }
      } else {
        if (fullSem > 0 && mutex) {
          const consumed = buffer.shift()!;
          emptySem++;
          fullSem--;
          outIndex = (outIndex + 1) % bufferCapacity;
          steps.push({
            step: i,
            action: 'CONSUME',
            item: consumed,
            buffer: [...buffer],
            bufferSize: bufferCapacity,
            inIndex,
            outIndex,
            mutexState: true,
            emptySem,
            fullSem,
          });
        } else {
          steps.push({
            step: i,
            action: 'BLOCKED_EMPTY',
            buffer: [...buffer],
            bufferSize: bufferCapacity,
            inIndex,
            outIndex,
            mutexState: true,
            emptySem,
            fullSem,
          });
        }
      }
    }

    return steps;
  }

  /**
   * 4. Dining Philosophers Simulation
   */
  public runDiningPhilosophers(numPhilosophers: number = 5): DiningPhilosophersStep[] {
    const steps: DiningPhilosophersStep[] = [];
    const forks = Array(numPhilosophers).fill(true); // true = available
    const states: ('THINKING' | 'HUNGRY' | 'EATING')[] = Array(numPhilosophers).fill('THINKING');

    const getPhils = () => states.map((st, i) => ({
      id: i,
      state: st,
      leftFork: !forks[i],
      rightFork: !forks[(i + 1) % numPhilosophers],
    }));

    // Step 1: Initial state
    steps.push({
      step: 1,
      philosophers: getPhils(),
      forks: [...forks],
      log: 'All 5 Philosophers (Students) are THINKING.',
    });

    // Step 2: Phil 0 becomes hungry and picks up left & right fork
    states[0] = 'HUNGRY';
    if (forks[0] && forks[1]) {
      forks[0] = false;
      forks[1] = false;
      states[0] = 'EATING';
    }
    steps.push({
      step: 2,
      philosophers: getPhils(),
      forks: [...forks],
      log: 'Phil 0 becomes HUNGRY, picks up Fork 0 and Fork 1 -> EATING.',
    });

    // Step 3: Phil 1 becomes hungry, left fork (Fork 1) is taken by Phil 0
    states[1] = 'HUNGRY';
    steps.push({
      step: 3,
      philosophers: getPhils(),
      forks: [...forks],
      log: 'Phil 1 becomes HUNGRY, attempts Fork 1 (held by Phil 0) -> BLOCKED.',
    });

    // Step 4: Phil 2 becomes hungry and picks up Fork 2 and Fork 3
    states[2] = 'HUNGRY';
    if (forks[2] && forks[3]) {
      forks[2] = false;
      forks[3] = false;
      states[2] = 'EATING';
    }
    steps.push({
      step: 4,
      philosophers: getPhils(),
      forks: [...forks],
      log: 'Phil 2 picks up Fork 2 and Fork 3 -> EATING.',
    });

    // Step 5: Phil 0 finishes eating, releases forks
    forks[0] = true;
    forks[1] = true;
    states[0] = 'THINKING';

    // Phil 1 can now pick up Fork 1 and Fork 2? Fork 2 is held by Phil 2, so Phil 1 waits or acquires Fork 1
    if (forks[1] && forks[2]) {
      forks[1] = false;
      forks[2] = false;
      states[1] = 'EATING';
    }
    steps.push({
      step: 5,
      philosophers: getPhils(),
      forks: [...forks],
      log: 'Phil 0 finishes EATING & releases forks. Phil 1 acquires Fork 1 but Fork 2 is held by Phil 2.',
    });

    return steps;
  }

  /**
   * 5. Readers-Writers Simulation
   */
  public runReadersWriters(): ReadersWritersStep[] {
    const steps: ReadersWritersStep[] = [];
    let readerCount = 0;
    let rwMutexLocked = false;
    let activeReaders: string[] = [];
    let activeWriter: string | null = null;
    let waitingQueue: string[] = [];

    // Step 1: Reader 1 arrives
    readerCount++;
    rwMutexLocked = true;
    activeReaders.push('Reader-1');
    steps.push({
      step: 1,
      action: 'READ_START',
      activeReaders: [...activeReaders],
      activeWriter,
      readerCount,
      rwMutexLocked,
      waitingQueue: [...waitingQueue],
      log: 'Reader-1 starts reading lab records. Lock rw_mutex (readerCount = 1).',
    });

    // Step 2: Reader 2 arrives
    readerCount++;
    activeReaders.push('Reader-2');
    steps.push({
      step: 2,
      action: 'READ_START',
      activeReaders: [...activeReaders],
      activeWriter,
      readerCount,
      rwMutexLocked,
      waitingQueue: [...waitingQueue],
      log: 'Reader-2 starts reading concurrently. Shared access granted.',
    });

    // Step 3: Writer 1 arrives
    waitingQueue.push('Writer-1');
    steps.push({
      step: 3,
      action: 'BLOCKED',
      activeReaders: [...activeReaders],
      activeWriter,
      readerCount,
      rwMutexLocked,
      waitingQueue: [...waitingQueue],
      log: 'Writer-1 arrives to update lab records. Blocked because active readers exist.',
    });

    // Step 4: Readers finish
    activeReaders = [];
    readerCount = 0;
    rwMutexLocked = false;
    // Writer-1 proceeds
    waitingQueue.shift();
    activeWriter = 'Writer-1';
    rwMutexLocked = true;
    steps.push({
      step: 4,
      action: 'WRITE_START',
      activeReaders: [],
      activeWriter: 'Writer-1',
      readerCount: 0,
      rwMutexLocked: true,
      waitingQueue: [],
      log: 'All readers completed. Writer-1 acquires exclusive lock and starts writing.',
    });

    return steps;
  }

  /**
   * 6. Sleeping Barber Simulation
   */
  public runSleepingBarber(maxChairs: number = 3): SleepingBarberStep[] {
    const steps: SleepingBarberStep[] = [];
    let barberState: 'SLEEPING' | 'BUSY' = 'SLEEPING';
    let currentCustomer: string | null = null;
    let waitingChairs: string[] = [];

    // Step 1: Initial state
    steps.push({
      step: 1,
      action: 'BARBER_SLEEPS',
      barberState: 'SLEEPING',
      currentCustomer: null,
      waitingChairs: [],
      maxChairs,
      log: 'No lab assistant / barber present. Barber is SLEEPING in chair.',
    });

    // Step 2: Customer 1 arrives
    barberState = 'BUSY';
    currentCustomer = 'Student-1';
    steps.push({
      step: 2,
      action: 'CUSTOMER_ARRIVES',
      barberState: 'BUSY',
      currentCustomer: 'Student-1',
      waitingChairs: [],
      maxChairs,
      log: 'Student-1 arrives, wakes up Barber, gets serviced in main chair.',
    });

    // Step 3: Customer 2, 3, 4 arrive
    waitingChairs = ['Student-2', 'Student-3', 'Student-4'];
    steps.push({
      step: 3,
      action: 'CUSTOMER_WAITS',
      barberState: 'BUSY',
      currentCustomer: 'Student-1',
      waitingChairs: [...waitingChairs],
      maxChairs,
      log: 'Student-2, 3, 4 arrive. Main chair occupied. All 3 take waiting chairs.',
    });

    // Step 4: Customer 5 arrives (Chairs full!)
    steps.push({
      step: 4,
      action: 'CUSTOMER_LEAVES',
      barberState: 'BUSY',
      currentCustomer: 'Student-1',
      waitingChairs: [...waitingChairs],
      maxChairs,
      log: 'Student-5 arrives. Waiting room FULL (3/3 chairs occupied). Student-5 leaves lab!',
    });

    return steps;
  }
}

export const synchronizationEngine = new SynchronizationEngine();
