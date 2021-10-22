import { getFileContent, findFilesInDir, getVariantKey } from './fsUtils';

describe('lib/utils/fs/fsUtils test', () => {
  describe('getFileContent', () => {
    it(`json file has json and raw property not null`, () => {
      const currentgetFileContent = getFileContent(
        'tests/fixtures/data/global.json',
      );
      expect(currentgetFileContent).not.toHaveProperty('json', null);
      expect(currentgetFileContent).not.toHaveProperty('raw', null);
    });
    it(`not json file has json property null and raw not null`, () => {
      const currentgetFileContent = getFileContent(
        'tests/fixtures/example.txt',
      );
      expect(currentgetFileContent).toHaveProperty('json', null);
      expect(currentgetFileContent).not.toHaveProperty('raw', null);
    });
  });

  describe('findFilesInDir', () => {
    it('gets correct files in dir', () => {
      const currentFindFilesInDir = findFilesInDir('tests/fixtures', '*');
      expect(currentFindFilesInDir).toContain('example.txt');
      expect(currentFindFilesInDir).toHaveLength(1);
    });
  });

  describe('getVariantKey', () => {
    it('"/example--variant.json" gets "variant"', () => {
      expect(getVariantKey('/example--variant.json')).toBe('variant');
    });
    it('"/example__variant.json" gets null', () => {
      expect(getVariantKey('/example__variant.json')).toBeNull();
    });
  });
});
