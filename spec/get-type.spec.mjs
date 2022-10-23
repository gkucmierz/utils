
import { getType } from '../src/get-type.mjs';

describe('get-type', () => {

  it('should undefined', () => {
    expect(getType(undefined)).toEqual('undefined');
  });

  it('should null', () => {
    expect(getType(null)).toEqual('null');
  });

  it('should boolean', () => {
    expect(getType(true)).toEqual('boolean');
    expect(getType(false)).toEqual('boolean');
    expect(getType(new Boolean)).toEqual('boolean');
  });

  it('should number', () => {
    expect(getType(1)).toEqual('number');
    expect(getType(1e3)).toEqual('number');
    expect(getType(1_000)).toEqual('number');
    expect(getType(NaN)).toEqual('number');
    expect(getType(Infinity)).toEqual('number');
  });

  it('should bigint', () => {
    expect(getType(1n)).toEqual('bigint');
  });

  it('should string', () => {
    expect(getType('hello')).toEqual('string');
    expect(getType(new String)).toEqual('string');
  });

  it('should Symbol', () => {
    expect(getType(Symbol())).toEqual('symbol');
  });

  it('should function', () => {
    expect(getType(() => 0)).toEqual('function');
    expect(getType(function() { })).toEqual('function');
    expect(getType(new Function)).toEqual('function');
  });

  it('should generatorfunction', () => {
    expect(getType(function*() { })).toEqual('generatorfunction');
  });

  it('should date', () => {
    expect(getType(new Date)).toEqual('date');
  });

  it('should array', () => {
    expect(getType([])).toEqual('array');
    expect(getType(new Array)).toEqual('array');
  });

  it('should object', () => {
    expect(getType({})).toEqual('object');
    expect(getType(new Object)).toEqual('object');
    expect(getType(new Proxy({}, {}))).toEqual('object');
  });

  it('should map', () => {
    expect(getType(new Map)).toEqual('map');
    expect(getType(new WeakMap)).toEqual('weakmap');
  });

  it('should set', () => {
    expect(getType(new Set)).toEqual('set');
    expect(getType(new WeakSet)).toEqual('weakset');
  });
});
