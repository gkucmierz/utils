import { setSafeInterval } from '../src/set-safe-interval.mjs';

const sleep = ms => new Promise(r => setTimeout(r, ms));

describe('setSafeInterval', () => {
  it('should execute immediately synchronously if immediate=true and nextTick=false', () => {
    let count = 0;
    const clear = setSafeInterval(() => {
      count++;
    }, 50, true, false);
    
    expect(count).toBe(1);
    clear();
  });

  it('should execute immediately but asynchronously if nextTick=true', async () => {
    let count = 0;
    const clear = setSafeInterval(() => {
      count++;
    }, 50, true, true);
    
    expect(count).toBe(0);
    await sleep(10);
    expect(count).toBe(1);
    clear();
  });

  it('should not execute immediately if immediate=false', async () => {
    let count = 0;
    const clear = setSafeInterval(() => {
      count++;
    }, 30, false);
    
    expect(count).toBe(0);
    await sleep(40);
    expect(count).toBe(1);
    clear();
  });

  it('should wait for async callbacks before scheduling next tick', async () => {
    let count = 0;
    let invocations = 0;
    const clear = setSafeInterval(async () => {
      invocations++;
      await sleep(30);
      count++;
    }, 30, true, false);

    expect(invocations).toBe(1);
    expect(count).toBe(0); // Async cb not finished yet
    
    await sleep(40); 
    expect(count).toBe(1); // First cb finished
    expect(invocations).toBe(1); // Next tick hasn't fired yet because it waits 30ms AFTER cb finishes

    await sleep(30);
    expect(invocations).toBe(2); // Second cb fired
    expect(count).toBe(1); // Second cb still sleeping

    clear();
  });

  it('should stop executing when cleared', async () => {
    let count = 0;
    const clear = setSafeInterval(() => {
      count++;
    }, 30, true, false);
    
    expect(count).toBe(1);
    clear();
    await sleep(50);
    expect(count).toBe(1); // Should not increase
  });
});
