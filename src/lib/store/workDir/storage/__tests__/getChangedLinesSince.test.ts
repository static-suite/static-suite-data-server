import { config } from '@lib/config';
import { resolve } from 'path';
import { getChangedLinesSince } from '../getChangedLinesSince';

describe('workDir storage getChangedLinesSince test', () => {
  describe('getChangedLinesSince', () => {
    config.workDir = resolve('src/__tests__/fixtures/work');

    it(`Gets lines of log since given date`, () => {
      expect(getChangedLinesSince(new Date('2021-08-01'))).toEqual([
        '2021-08-16_07-11-55.666963__3504 delete [ID: 10] Prueba y cultiva tus propias hierbas | static-local://es/entity/node/article/10.json',
        '2021-08-16_07-12-45.771095__5959 write [ID: 10] Give it a go and grow your own herbs | static-local://en/entity/node/article/10.json',
        '2021-08-17_08-49-26.273927__5991 write [ID: static_export.settings] static_export.settings | static-local://es/config/static_export.settings.json',
        '2021-08-17_08-50-00.235800__1900 write [ID: 9] Salsa de chile ardiente | static-local://es/entity/node/recipe/9.json',
      ]);
    });
  });
});
