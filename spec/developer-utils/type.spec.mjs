import { Type, Types, is, of, same } from '../../main.mjs';

describe('Type system', () => {

  describe('Type constants', () => {
    it('should define basic type constants organized in semantic tiers', () => {
      // 1. Bottom values & Primitives
      expect(Type.UNDEFINED).toEqual('undefined');
      expect(Type.NULL).toEqual('null');
      expect(Type.BOOLEAN).toEqual('boolean');
      expect(Type.NUMBER).toEqual('number');
      expect(Type.NAN).toEqual('nan');
      expect(Type.BIGINT).toEqual('bigint');
      expect(Type.STRING).toEqual('string');
      expect(Type.SYMBOL).toEqual('symbol');

      // 2. Core Objects & Callables
      expect(Type.OBJECT).toEqual('object');
      expect(Type.ARRAY).toEqual('array');
      expect(Type.FUNCTION).toEqual('function');

      // 3. Standard Built-ins
      expect(Type.DATE).toEqual('date');
      expect(Type.REGEXP).toEqual('regexp');
      expect(Type.ERROR).toEqual('error');
      expect(Type.PROMISE).toEqual('promise');

      // 4. Collections
      expect(Type.MAP).toEqual('map');
      expect(Type.SET).toEqual('set');
      expect(Type.WEAKMAP).toEqual('weakmap');
      expect(Type.WEAKSET).toEqual('weakset');
      expect(Type.WEAKREF).toEqual('weakref');
    });

    it('should provide Types alias', () => {
      expect(Types).toBe(Type);
      expect(Types.NUMBER).toEqual('number');
      expect(Types.NAN).toEqual('nan');
    });
  });

  describe('Type.of and of()', () => {
    it('should detect undefined', () => {
      expect(Type.of(undefined)).toEqual('undefined');
      expect(of(undefined)).toEqual('undefined');
    });

    it('should detect null', () => {
      expect(Type.of(null)).toEqual('null');
      expect(of(null)).toEqual('null');
    });

    it('should detect boolean', () => {
      expect(Type.of(true)).toEqual('boolean');
      expect(Type.of(false)).toEqual('boolean');
      expect(Type.of(new Boolean)).toEqual('boolean');
    });

    it('should detect number and distinguish nan', () => {
      expect(Type.of(1)).toEqual('number');
      expect(Type.of(1e3)).toEqual('number');
      expect(Type.of(1_000)).toEqual('number');
      expect(Type.of(0)).toEqual('number');
      expect(Type.of(-3.14)).toEqual('number');
      expect(Type.of(Infinity)).toEqual('number');
      expect(Type.of(-Infinity)).toEqual('number');
      // NaN is uniquely 'nan'
      expect(Type.of(NaN)).toEqual('nan');
      expect(of(NaN)).toEqual('nan');
    });

    it('should detect bigint', () => {
      expect(Type.of(1n)).toEqual('bigint');
    });

    it('should detect string', () => {
      expect(Type.of('hello')).toEqual('string');
      expect(Type.of(new String)).toEqual('string');
    });

    it('should detect Symbol', () => {
      expect(Type.of(Symbol())).toEqual('symbol');
    });

    it('should detect functions', () => {
      expect(Type.of(() => 0)).toEqual('function');
      expect(Type.of(function() { })).toEqual('function');
      expect(Type.of(new Function)).toEqual('function');
      expect(Type.of(function*() { })).toEqual('generatorfunction');
      expect(Type.of(async () => { })).toEqual('asyncfunction');
    });

    it('should detect date, regexp, error, promise', () => {
      expect(Type.of(new Date)).toEqual('date');
      expect(Type.of(/abc/)).toEqual('regexp');
      expect(Type.of(new Error)).toEqual('error');
      expect(Type.of(Promise.resolve())).toEqual('promise');
    });

    it('should detect array and objects', () => {
      expect(Type.of([])).toEqual('array');
      expect(Type.of(new Array)).toEqual('array');
      expect(Type.of({})).toEqual('object');
      expect(Type.of(Object.create(null))).toEqual('object');
      expect(Type.of(new Proxy({}, {}))).toEqual('object');
    });

    it('should detect collections', () => {
      expect(Type.of(new Map)).toEqual('map');
      expect(Type.of(new WeakMap)).toEqual('weakmap');
      expect(Type.of(new Set)).toEqual('set');
      expect(Type.of(new WeakSet)).toEqual('weakset');
      expect(Type.of(new WeakRef({}))).toEqual('weakref');
    });
  });

  describe('Type.is and is()', () => {
    it('should check by type string constant', () => {
      expect(Type.is(42, Type.NUMBER)).toBe(true);
      expect(Type.is(NaN, Type.NUMBER)).toBe(false);
      expect(Type.is(NaN, Type.NAN)).toBe(true);
      expect(Type.is('hello', Type.STRING)).toBe(true);
      expect(Type.is([], Type.ARRAY)).toBe(true);
      expect(Type.is({}, Type.OBJECT)).toBe(true);
      expect(is('hello', 'string')).toBe(true);
    });

    it('should check by Constructor / Class', () => {
      expect(Type.is(42, Number)).toBe(true);
      expect(Type.is(NaN, Number)).toBe(false);
      expect(Type.is('abc', String)).toBe(true);
      expect(Type.is(true, Boolean)).toBe(true);
      expect(Type.is(10n, BigInt)).toBe(true);
      expect(Type.is(Symbol(), Symbol)).toBe(true);
      expect(Type.is([], Array)).toBe(true);
      expect(Type.is(new Date(), Date)).toBe(true);
      expect(Type.is(() => {}, Function)).toBe(true);
      expect(Type.is(async () => {}, Function)).toBe(true);
      expect(Type.is({}, Object)).toBe(true);
      expect(Type.is(Object.create(null), Object)).toBe(true);
      expect(Type.is(null, Object)).toBe(false);
      expect(Type.is(42, Object)).toBe(false);
    });

    it('should support union arrays', () => {
      expect(Type.is(42, [Type.STRING, Type.NUMBER])).toBe(true);
      expect(Type.is('hello', [Type.STRING, Type.NUMBER])).toBe(true);
      expect(Type.is(true, [Type.STRING, Type.NUMBER])).toBe(false);
      expect(is(100, [String, Number])).toBe(true);
      expect(is(NaN, [String, Number])).toBe(false);
    });
  });

  describe('Type.same and same()', () => {
    it('should safely compare primitive types', () => {
      expect(Type.same(1, 2)).toBe(true);
      expect(Type.same(1, '1')).toBe(false);
      expect(Type.same('a', 'b')).toBe(true);
      expect(Type.same(true, false)).toBe(true);
      expect(Type.same(true, 1)).toBe(false);
    });

    it('should prevent JavaScript NaN and null/object traps', () => {
      expect(Type.same(42, NaN)).toBe(false);
      expect(Type.same(NaN, NaN)).toBe(true);
      expect(Type.same(null, {})).toBe(false);
      expect(Type.same([], {})).toBe(false);
      expect(Type.same(null, undefined)).toBe(false);
    });

    it('should match standalone same() export', () => {
      expect(same(1, 2)).toBe(true);
      expect(same(1, NaN)).toBe(false);
    });
  });
});
