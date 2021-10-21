import { getVariantKey } from './fsUtils';

describe('FsUtils test', () => {
  beforeEach(() => null);

  describe('getVariantKey', () => {
    it('"/example--variant.json" get "variant"', () => {
      expect(getVariantKey('/example--variant.json')).toBe('variant');
    });
  });
});
