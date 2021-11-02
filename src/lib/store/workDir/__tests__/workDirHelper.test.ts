import { config } from '@lib/config';
import { resolve } from 'path';
import { workDirHelper } from '../workDirHelper';

describe('workDirHelper test', () => {
  describe('getChangedFilesSince', () => {
    config.workDir = resolve('src/mocks/fixtures/work');

    it(`Gets modified and deleted files from static-suite log`, () => {
      expect(
        workDirHelper.getChangedFilesSince(new Date('2021-08-01')),
      ).toEqual({
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
