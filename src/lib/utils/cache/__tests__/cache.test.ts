import { cache } from '../cacheBinManager';

describe('Cache test', () => {
  it('newly created cache bins are empty', () => {
    expect(cache.bin('bin1').size).toBe(0);
  });

  it('using several cache bins does not affect any of them', () => {
    cache.bin('bin1').set('key1', 'value1');
    cache.bin('bin2').set('key2', 'value2');

    expect(cache.bin('bin1').get('key1')).toBe('value1');
    expect(cache.bin('bin2').get('key2')).toBe('value2');
    expect(cache.bin('bin1').size).toBe(1);
    expect(cache.bin('bin2').size).toBe(1);
  });

  it('gets the keys of all cache bins', () => {
    cache.bin('bin1');
    cache.bin('bin2');

    expect(cache.keys()).toEqual(['bin1', 'bin2']);
  });
});
