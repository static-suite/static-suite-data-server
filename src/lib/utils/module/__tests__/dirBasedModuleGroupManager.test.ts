import fs from 'fs';
import path from 'path';
import { config } from '@lib/config';
import { dirBasedModuleGroupManager } from '@lib/utils/module';

config.queryDir = fs.realpathSync(
  path.resolve(path.join(__dirname, '../__mocks__')),
);
export const exampleQueryManager = dirBasedModuleGroupManager('query');

describe('dirBasedModuleGroupManager test', () => {
  describe('getModuleGroupInfo', () => {
    it('loads a directory of modules', () => {
      const moduleGroupInfo = exampleQueryManager.getModuleGroupInfo();
      expect(moduleGroupInfo.size).toBe(2);
      expect(Array.from(moduleGroupInfo.keys())).toStrictEqual([
        'dummyModule',
        'dummyModule2',
      ]);
      expect(moduleGroupInfo.get('dummyModule')).not.toBe(null);
      expect(moduleGroupInfo.get('dummyModule2')).not.toBe(null);
    });
  });

  describe('reset', () => {
    it('resets a directory of modules', () => {
      const moduleGroupInfo = exampleQueryManager.getModuleGroupInfo();
      expect(moduleGroupInfo.size).toBe(2);

      exampleQueryManager.reset();
      expect(moduleGroupInfo.size).toBe(0);
    });
  });
});
