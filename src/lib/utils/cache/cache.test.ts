import { cache } from './cacheBinManager';

describe('Cache test', () => {
  it('newly created cache bins are empty', () => {
    expect(cache.bin('bin1').size).toBe(0);
  });

  it('gets the keys of all cache bins', () => {
    cache.bin('bin1');
    cache.bin('bin2');
    expect(cache.keys()).toStrictEqual(['bin1', 'bin2']);
  });

  it(`atomically resets a given cache bin out of several ones`, () => {
    cache.bin('bin1').set('key1', 'value1');
    cache.bin('bin2').set('key2', 'value2');
    expect(cache.bin('bin1').size).toBe(1);
    expect(cache.bin('bin2').size).toBe(1);
    cache.reset('bin2');
    expect(cache.bin('bin1').size).toBe(1);
    expect(cache.bin('bin2').size).toBe(0);
  });
});
