import { measurePerformance } from '../src/measure-performance.mjs';

describe('measure-performance', () => {
  it('returns an object with memo and duration', () => {
    const result = measurePerformance(() => {}, 10, 'test-memo');
    expect(result).toBeDefined();
    expect(result.memo).toEqual('test-memo');
    expect(typeof result.duration).toEqual('number');
  });

  it('runs the function the specified number of steps', () => {
    let count = 0;
    measurePerformance(() => { count++; }, 50);
    expect(count).toEqual(50);
  });
});
