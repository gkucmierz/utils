import { ConflatingQueue } from '../../src/data-structures/ConflatingQueue.mjs';

const sleep = ms => new Promise(r => setTimeout(r, ms));

describe('ConflatingQueue', () => {
  it('should execute a single enqueued task successfully', async () => {
    const queue = new ConflatingQueue();
    const result = await queue.enqueue('task1', async () => {
      await sleep(10);
      return 42;
    });

    expect(result).toBe(42);
    expect(queue.isIdle).toBe(true);
  });

  it('should execute sequential tasks with different keys in FIFO order', async () => {
    const queue = new ConflatingQueue();
    const executionOrder = [];

    const p1 = queue.enqueue('key1', async () => {
      await sleep(20);
      executionOrder.push('k1');
      return 1;
    });

    const p2 = queue.enqueue('key2', async () => {
      await sleep(10);
      executionOrder.push('k2');
      return 2;
    });

    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toBe(1);
    expect(r2).toBe(2);
    expect(executionOrder).toEqual(['k1', 'k2']);
    expect(queue.isIdle).toBe(true);
  });

  it('should conflate (supersede) older pending tasks when a newer task for the same key arrives', async () => {
    const queue = new ConflatingQueue();
    const executedValues = [];

    // Task 1 starts executing immediately (locks queue for 40ms)
    const p1 = queue.enqueue('brightness', async () => {
      await sleep(40);
      executedValues.push(10);
      return 10;
    });

    // While Task 1 is running, queue up 3 updates for the SAME key 'brightness'
    const p2 = queue.enqueue('brightness', async () => {
      await sleep(10);
      executedValues.push(20);
      return 20;
    });

    const p3 = queue.enqueue('brightness', async () => {
      await sleep(10);
      executedValues.push(50);
      return 50;
    });

    const p4 = queue.enqueue('brightness', async () => {
      await sleep(10);
      executedValues.push(80);
      return 80;
    });

    const [r1, r2, r3, r4] = await Promise.all([p1, p2, p3, p4]);

    // First task ran to completion
    expect(r1).toBe(10);

    // Intermediate tasks (p2, p3) were superseded
    expect(r2).toEqual({ superseded: true });
    expect(r3).toEqual({ superseded: true });

    // Last task ran to completion with latest value
    expect(r4).toBe(80);

    // Only task 1 (10) and task 4 (80) were physically executed
    expect(executedValues).toEqual([10, 80]);
    expect(queue.isIdle).toBe(true);
  });

  it('should maintain independent conflation per distinct key', async () => {
    const queue = new ConflatingQueue();
    const executed = [];

    // Long running task 1
    const p1 = queue.enqueue('display1', async () => {
      await sleep(50);
      executed.push('disp1-v1');
      return 'disp1-v1';
    });

    // Enqueue multiple updates for display1 and display2
    const p2 = queue.enqueue('display1', async () => {
      executed.push('disp1-v2');
      return 'disp1-v2';
    });
    const p3 = queue.enqueue('display1', async () => {
      executed.push('disp1-v3');
      return 'disp1-v3';
    });

    const p4 = queue.enqueue('display2', async () => {
      executed.push('disp2-v1');
      return 'disp2-v1';
    });
    const p5 = queue.enqueue('display2', async () => {
      executed.push('disp2-v2');
      return 'disp2-v2';
    });

    const [r1, r2, r3, r4, r5] = await Promise.all([p1, p2, p3, p4, p5]);

    expect(r1).toBe('disp1-v1');
    expect(r2).toEqual({ superseded: true });
    expect(r3).toBe('disp1-v3');
    expect(r4).toEqual({ superseded: true });
    expect(r5).toBe('disp2-v2');

    expect(executed).toEqual(['disp1-v1', 'disp1-v3', 'disp2-v2']);
  });

  it('should handle task errors gracefully and continue processing subsequent tasks', async () => {
    const queue = new ConflatingQueue();
    let secondRan = false;

    const p1 = queue.enqueue('errKey', async () => {
      await sleep(20);
      throw new Error('Hardware bus failure');
    });

    const p2 = queue.enqueue('nextKey', async () => {
      await sleep(10);
      secondRan = true;
      return 'recovered';
    });

    await expectAsync(p1).toBeRejectedWithError('Hardware bus failure');
    const r2 = await p2;

    expect(secondRan).toBe(true);
    expect(r2).toBe('recovered');
    expect(queue.isIdle).toBe(true);
  });

  it('should support cancel(key) to abort pending unstarted tasks', async () => {
    const queue = new ConflatingQueue();

    const p1 = queue.enqueue('running', async () => {
      await sleep(40);
      return 'done';
    });

    const p2 = queue.enqueue('toCancel', async () => {
      return 'should not run';
    });

    expect(queue.cancel('toCancel')).toBe(true);
    expect(queue.cancel('nonExistent')).toBe(false);

    const r2 = await p2;
    expect(r2).toEqual({ cancelled: true });

    const r1 = await p1;
    expect(r1).toBe('done');
  });

  it('should support clear() to wipe all pending tasks', async () => {
    const queue = new ConflatingQueue();

    const p1 = queue.enqueue('k1', async () => {
      await sleep(40);
      return 'ran';
    });

    const p2 = queue.enqueue('k2', async () => 'k2');
    const p3 = queue.enqueue('k3', async () => 'k3');

    expect(queue.size.pending).toBe(2);
    queue.clear();
    expect(queue.size.pending).toBe(0);

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
    expect(r1).toBe('ran');
    expect(r2).toEqual({ cancelled: true });
    expect(r3).toEqual({ cancelled: true });
  });

  it('should accurately report diagnostic stats via getStats()', async () => {
    const queue = new ConflatingQueue({ maxPending: 10 });

    expect(queue.getStats()).toEqual({
      running: 0,
      pending: 0,
      total: 0,
      concurrency: 1,
      maxPending: 10,
      isIdle: true,
      pendingKeys: []
    });

    const p1 = queue.enqueue('a', async () => {
      await sleep(30);
      return 'a';
    });
    const p2 = queue.enqueue('b', async () => {
      await sleep(10);
      return 'b';
    });

    const statsDuring = queue.getStats();
    expect(statsDuring.running).toBe(1);
    expect(statsDuring.pending).toBe(1);
    expect(statsDuring.isIdle).toBe(false);
    expect(statsDuring.pendingKeys).toEqual(['b']);

    await Promise.all([p1, p2]);
    expect(queue.getStats().isIdle).toBe(true);
  });

  it('should resolve onIdle() when all queued tasks complete', async () => {
    const queue = new ConflatingQueue();

    queue.enqueue('a', () => sleep(20));
    queue.enqueue('b', () => sleep(20));

    expect(queue.isIdle).toBe(false);
    await queue.onIdle();
    expect(queue.isIdle).toBe(true);
  });

  it('should reject when maxPending limit is exceeded', async () => {
    const queue = new ConflatingQueue({ maxPending: 2 });

    // Running task
    queue.enqueue('a', () => sleep(50));
    // Pending 1
    queue.enqueue('b', () => sleep(10));
    // Pending 2
    queue.enqueue('c', () => sleep(10));

    // Pending 3 (exceeds maxPending = 2)
    await expectAsync(queue.enqueue('d', () => sleep(10)))
      .toBeRejectedWithError(/maxPending limit \(2\) exceeded/);
  });
});
