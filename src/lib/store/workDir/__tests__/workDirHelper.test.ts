import path from 'path';
import fs from 'fs';
import { config } from '@lib/config';
import { workDirHelper } from '../workDirHelper';

describe('workDirHelper test', () => {
  describe('getChangedFilesSince', () => {
    config.workDir = fs.realpathSync(
      path.resolve('src/__tests__/fixtures/work'),
    );

    it(`Gets modified and deleted files from static-suite log`, () => {
      expect(
        workDirHelper.getChangedFilesBetween(
          '2021-08-16_07-11-55.666963__3503',
          '2021-08-17_08-50-00.235800__1900',
        ),
      ).toEqual({
        fromUniqueId: '2021-08-16_07-11-55.666963__3503',
        toUniqueId: '2021-08-17_08-50-00.235800__1900',
        deleted: ['es/entity/node/article/10.json'],
        updated: [
          'en/entity/node/article/10.json',
          'es/config/static_export.settings.json',
          'es/entity/node/recipe/9.json',
        ],
      });
    });
  });
});
