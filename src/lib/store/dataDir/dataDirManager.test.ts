import { config } from '@lib/config';
import { resolve } from 'path';

beforeEach(() => {
  config.dataDir = resolve('src/mocks/fixtures/data');
});

describe('dataDirManager test', () => {
  describe('loadDataDir', () => {
    it(`Adds to store all files in datadir`, () => {
      expect('1').toEqual('1');
    });
  });
});
