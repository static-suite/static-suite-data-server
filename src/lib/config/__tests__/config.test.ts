import { RunMode } from '@lib/dataServer.types';
import { setConfig } from '../config';
import { ConfigOptions } from '../config.types';

describe('Config test', () => {
  describe('setConfig', () => {
    it('Returns correct config', () => {
      const config: ConfigOptions = {
        dataDir: 'src/mocks/fixtures/data/',
        workDir: 'src/mocks/fixtures/work/',
        queryDir: 'src/mocks/fixtures/query',
        hookDir: 'src/mocks/fixtures/hook',
        runMode: RunMode.DEV,
      };
      expect(setConfig(config)).toEqual(config);
    });

    it('Required option dataDir returns expected error', () => {
      const config = {
        runMode: RunMode.DEV,
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(() => setConfig(config)).toThrowError(
        'Required option not provided: "dataDir".',
      );
    });
    it('Required option runMode returns expected error', () => {
      const config = {
        dataDir: 'src/mocks/fixtures/data/',
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(() => setConfig(config)).toThrowError(
        'Required option not provided: "runMode"',
      );
    });

    it('wrong option runMode returns expected error', () => {
      const config = {
        dataDir: 'src/mocks/fixtures/data/',
        runMode: 'xx',
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(() => setConfig(config)).toThrowError(
        'Invalid value provided for "runMode": ',
      );
    });

    it('Wrong dataDir returns expected error', () => {
      const config: ConfigOptions = {
        dataDir: 'non-existent-dir',
        runMode: RunMode.DEV,
      };
      expect(() => setConfig(config)).toThrowError(
        'Cannot find dataDir directory: ',
      );
    });

    it('Wrong workDir returns expected error', () => {
      const config: ConfigOptions = {
        dataDir: 'src/mocks/fixtures/data',
        workDir: 'non-existent-dir',
        runMode: RunMode.DEV,
      };
      expect(() => setConfig(config)).toThrowError(
        'Cannot find workDir directory: ',
      );
    });

    it('Wrong queryDir returns expected error', () => {
      const config: ConfigOptions = {
        dataDir: 'src/mocks/fixtures/data',
        queryDir: 'non-existent-dir',
        runMode: RunMode.DEV,
      };
      expect(() => setConfig(config)).toThrowError(
        'Cannot find queryDir directory: ',
      );
    });

    it('Wrong postProcessor returns expected error', () => {
      const config: ConfigOptions = {
        dataDir: 'src/mocks/fixtures/data',
        hookDir: 'non-existent-file',
        runMode: RunMode.DEV,
      };
      expect(() => setConfig(config)).toThrowError(
        'Cannot find postProcessor module: ',
      );
    });
  });
});
