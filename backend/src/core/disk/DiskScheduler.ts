import { DiskScheduleResult } from '../../types.js';

export class DiskScheduler {

  /**
   * 1. FCFS Disk Scheduling
   */
  public fcfs(requestQueue: number[], initialHead: number): DiskScheduleResult {
    let currentHead = initialHead;
    let totalHeadMovement = 0;
    const seekSequence: number[] = [initialHead];
    const stepDetails: DiskScheduleResult['stepDetails'] = [];

    requestQueue.forEach((req, idx) => {
      const dist = Math.abs(req - currentHead);
      totalHeadMovement += dist;
      seekSequence.push(req);

      stepDetails.push({
        step: idx + 1,
        currentHead,
        targetHead: req,
        distance: dist,
      });

      currentHead = req;
    });

    const avgSeekDistance = Number((totalHeadMovement / requestQueue.length).toFixed(2));

    return {
      algorithm: 'FCFS',
      requestQueue,
      initialHead,
      seekSequence,
      totalHeadMovement,
      avgSeekDistance,
      stepDetails,
    };
  }

  /**
   * 2. SSTF (Shortest Seek Time First)
   */
  public sstf(requestQueue: number[], initialHead: number): DiskScheduleResult {
    let currentHead = initialHead;
    let totalHeadMovement = 0;
    const remaining = [...requestQueue];
    const seekSequence: number[] = [initialHead];
    const stepDetails: DiskScheduleResult['stepDetails'] = [];
    let stepCount = 1;

    while (remaining.length > 0) {
      // Find request with minimal absolute distance from current head
      let minIdx = 0;
      let minDistance = Math.abs(remaining[0] - currentHead);

      for (let i = 1; i < remaining.length; i++) {
        const dist = Math.abs(remaining[i] - currentHead);
        if (dist < minDistance) {
          minDistance = dist;
          minIdx = i;
        }
      }

      const target = remaining[minIdx];
      totalHeadMovement += minDistance;
      seekSequence.push(target);

      stepDetails.push({
        step: stepCount++,
        currentHead,
        targetHead: target,
        distance: minDistance,
      });

      currentHead = target;
      remaining.splice(minIdx, 1);
    }

    const avgSeekDistance = Number((totalHeadMovement / requestQueue.length).toFixed(2));

    return {
      algorithm: 'SSTF',
      requestQueue,
      initialHead,
      seekSequence,
      totalHeadMovement,
      avgSeekDistance,
      stepDetails,
    };
  }

  /**
   * 3. SCAN (Elevator Algorithm)
   */
  public scan(
    requestQueue: number[],
    initialHead: number,
    diskSize: number = 200,
    direction: 'LEFT' | 'RIGHT' = 'RIGHT'
  ): DiskScheduleResult {
    let currentHead = initialHead;
    let totalHeadMovement = 0;
    const seekSequence: number[] = [initialHead];
    const stepDetails: DiskScheduleResult['stepDetails'] = [];

    const left = requestQueue.filter(r => r < initialHead).sort((a, b) => b - a);
    const right = requestQueue.filter(r => r >= initialHead).sort((a, b) => a - b);

    const sequence: number[] = [];

    if (direction === 'RIGHT') {
      sequence.push(...right);
      if (left.length > 0) {
        sequence.push(diskSize - 1); // Goes all the way to disk end
        sequence.push(...left);
      }
    } else {
      sequence.push(...left);
      if (right.length > 0) {
        sequence.push(0); // Goes to track 0
        sequence.push(...right);
      }
    }

    sequence.forEach((target, idx) => {
      const dist = Math.abs(target - currentHead);
      totalHeadMovement += dist;
      seekSequence.push(target);

      stepDetails.push({
        step: idx + 1,
        currentHead,
        targetHead: target,
        distance: dist,
      });

      currentHead = target;
    });

    const avgSeekDistance = Number((totalHeadMovement / requestQueue.length).toFixed(2));

    return {
      algorithm: `SCAN (${direction})`,
      requestQueue,
      initialHead,
      seekSequence,
      totalHeadMovement,
      avgSeekDistance,
      stepDetails,
    };
  }

  /**
   * 4. C-SCAN (Circular SCAN)
   */
  public cscan(
    requestQueue: number[],
    initialHead: number,
    diskSize: number = 200
  ): DiskScheduleResult {
    let currentHead = initialHead;
    let totalHeadMovement = 0;
    const seekSequence: number[] = [initialHead];
    const stepDetails: DiskScheduleResult['stepDetails'] = [];

    const left = requestQueue.filter(r => r < initialHead).sort((a, b) => a - b);
    const right = requestQueue.filter(r => r >= initialHead).sort((a, b) => a - b);

    const sequence: number[] = [...right];
    if (left.length > 0) {
      sequence.push(diskSize - 1);
      sequence.push(0); // Wrap around to track 0
      sequence.push(...left);
    }

    sequence.forEach((target, idx) => {
      const dist = Math.abs(target - currentHead);
      totalHeadMovement += dist;
      seekSequence.push(target);

      stepDetails.push({
        step: idx + 1,
        currentHead,
        targetHead: target,
        distance: dist,
      });

      currentHead = target;
    });

    const avgSeekDistance = Number((totalHeadMovement / requestQueue.length).toFixed(2));

    return {
      algorithm: 'C-SCAN',
      requestQueue,
      initialHead,
      seekSequence,
      totalHeadMovement,
      avgSeekDistance,
      stepDetails,
    };
  }

  /**
   * 5. LOOK Algorithm
   */
  public look(requestQueue: number[], initialHead: number, direction: 'LEFT' | 'RIGHT' = 'RIGHT'): DiskScheduleResult {
    let currentHead = initialHead;
    let totalHeadMovement = 0;
    const seekSequence: number[] = [initialHead];
    const stepDetails: DiskScheduleResult['stepDetails'] = [];

    const left = requestQueue.filter(r => r < initialHead).sort((a, b) => b - a);
    const right = requestQueue.filter(r => r >= initialHead).sort((a, b) => a - b);

    const sequence: number[] = direction === 'RIGHT' ? [...right, ...left] : [...left, ...right];

    sequence.forEach((target, idx) => {
      const dist = Math.abs(target - currentHead);
      totalHeadMovement += dist;
      seekSequence.push(target);

      stepDetails.push({
        step: idx + 1,
        currentHead,
        targetHead: target,
        distance: dist,
      });

      currentHead = target;
    });

    const avgSeekDistance = Number((totalHeadMovement / requestQueue.length).toFixed(2));

    return {
      algorithm: `LOOK (${direction})`,
      requestQueue,
      initialHead,
      seekSequence,
      totalHeadMovement,
      avgSeekDistance,
      stepDetails,
    };
  }

  /**
   * 6. C-LOOK Algorithm
   */
  public clook(requestQueue: number[], initialHead: number): DiskScheduleResult {
    let currentHead = initialHead;
    let totalHeadMovement = 0;
    const seekSequence: number[] = [initialHead];
    const stepDetails: DiskScheduleResult['stepDetails'] = [];

    const left = requestQueue.filter(r => r < initialHead).sort((a, b) => a - b);
    const right = requestQueue.filter(r => r >= initialHead).sort((a, b) => a - b);

    const sequence: number[] = [...right, ...left];

    sequence.forEach((target, idx) => {
      const dist = Math.abs(target - currentHead);
      totalHeadMovement += dist;
      seekSequence.push(target);

      stepDetails.push({
        step: idx + 1,
        currentHead,
        targetHead: target,
        distance: dist,
      });

      currentHead = target;
    });

    const avgSeekDistance = Number((totalHeadMovement / requestQueue.length).toFixed(2));

    return {
      algorithm: 'C-LOOK',
      requestQueue,
      initialHead,
      seekSequence,
      totalHeadMovement,
      avgSeekDistance,
      stepDetails,
    };
  }
}

export const diskScheduler = new DiskScheduler();
