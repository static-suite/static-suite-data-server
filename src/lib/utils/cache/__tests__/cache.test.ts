import { cache } from '../cacheBinManager';

describe('Cache test', () => {
  it('newly created cache bins are empty', () => {
    expect(cache.bin('bin1').size).toBe(0);
  });

  it('gets the keys of all cache bins', () => {
    cache.bin('bin1');
    cache.bin('bin2');
    expect(cache.keys()).toEqual(['bin1', 'bin2']);
  });
});
