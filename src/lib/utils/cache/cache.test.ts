import { cache } from './cache';

describe('lib/utils/cache/cache test', () => {
  describe('set/get', () => {
    it(`sets and gets correctly a value in bin`, () => {
      cache.set('test', 'test', 'test');
      expect(cache.get('test', 'test')).toBe('test');
      cache.set('test', 'test', 'test2');
      expect(cache.get('test', 'test')).toBe('test2');
    });
  });

  describe('delete', () => {
    it(`deletes correctly a value in bin`, () => {
      cache.delete('test', 'test');
      expect(cache.get('test', 'test')).toBeUndefined();
    });
  });
  describe('counts', () => {
    it(`count correctly the values in bin`, () => {
      cache.set('test', 'test', 'test');
      cache.set('test', 'test2', 'test2');
      expect(cache.count('test')).toBe(2);
    });
  });
  describe('reset', () => {
    it(`reset correctly the bin`, () => {
      cache.reset('test');
      expect(cache.count('test')).toBe(0);
    });
  });
});
