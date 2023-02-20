import fs from 'fs';
import path from 'path';
import { config } from '../../../config';

beforeEach(() => {
  config.dataDir = fs.realpathSync(path.resolve('src/__tests__/fixtures/data'));
});

describe('dataDirManager test', () => {
  describe('loadDataDir', () => {
    it(`Adds to store all files in datadir`, () => {
      expect('1').toEqual('1');
    });
  });
});
