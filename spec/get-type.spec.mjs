
import { getType } from '../src/get-type.mjs';

describe('get-type', () => {
  it('getType', function() {
    expect(getType(undefined)).toEqual('undefined');
    expect(getType(null)).toEqual('null');
    expect(getType(true)).toEqual('boolean');
    expect(getType(1)).toEqual('number');
    expect(getType(1n)).toEqual('bigint');
    expect(getType('1')).toEqual('string');
    expect(getType(Symbol())).toEqual('symbol');
    expect(getType(() => 0)).toEqual('function');
    expect(getType({})).toEqual('object');
  });
});
