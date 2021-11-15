import { RunMode } from '@lib/dataServer.types';
import { resolve } from 'path';
import { setConfig } from '../config';
import { ConfigOptions, NonSanitizedConfigOptions } from '../config.types';
import {
  InvalidRunMode,
  MissingDirectory,
  MissingRequiredOption,
} from '../error';

describe('Config test', () => {
  describe('setConfig', () => {
    it('Returns correct config', () => {
      const testConfig: NonSanitizedConfigOptions = {
        dataDir: 'src/__tests__/fixtures/data/',
        workDir: 'src/__tests__/fixtures/work/',
        queryDir: 'src/__tests__/fixtures/query',
        hookDir: 'src/__tests__/fixtures/hook',
      };
      const expectedconfig = {
        dataDir: resolve(testConfig.dataDir),
        workDir: resolve(<string>testConfig.workDir),
        queryDir: resolve(<string>testConfig.queryDir),
        hookDir: resolve(<string>testConfig.hookDir),
        runMode: 'prod',
      };
      expect(setConfig(testConfig)).toEqual(expectedconfig);
    });

    it('Required option dataDir returns expected error', () => {
      const config = {
        runMode: RunMode.DEV,
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(() => setConfig(config)).toThrowError(MissingRequiredOption);
    });

    it('wrong option runMode returns expected error', () => {
      const config = {
        dataDir: 'src/__tests__/fixtures/data/',
        runMode: 'xx',
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(() => setConfig(config)).toThrowError(InvalidRunMode);
    });

    it('Wrong dataDir returns expected error', () => {
      const config: ConfigOptions = {
        dataDir: 'non-existent-dir',
        runMode: RunMode.DEV,
      };

      expect.assertions(2);

      try {
        setConfig(config);
      } catch (error) {
        expect(error).toBeInstanceOf(MissingDirectory);
        expect(error).toHaveProperty('directoryId', 'dataDir');
      }
    });

    it('Wrong workDir returns expected error', () => {
      const config: ConfigOptions = {
        dataDir: 'src/__tests__/fixtures/data/',
        workDir: 'non-existent-dir',
        runMode: RunMode.DEV,
      };
      expect.assertions(2);

      try {
        setConfig(config);
      } catch (error) {
        expect(error).toBeInstanceOf(MissingDirectory);
        expect(error).toHaveProperty('directoryId', 'workDir');
      }
    });

    it('Wrong queryDir returns expected error', () => {
      const config: ConfigOptions = {
        dataDir: 'src/__tests__/fixtures/data/',
        queryDir: 'non-existent-dir',
        runMode: RunMode.DEV,
      };
      expect.assertions(2);

      try {
        setConfig(config);
      } catch (error) {
        expect(error).toBeInstanceOf(MissingDirectory);
        expect(error).toHaveProperty('directoryId', 'queryDir');
      }
    });

    it('Wrong hookDir returns expected error', () => {
      const config = {
        dataDir: 'src/__tests__/fixtures/data/',
        hookDir: 'non-existent-dir',
        runMode: RunMode.DEV,
      };
      expect.assertions(2);

      try {
        setConfig(config);
      } catch (error) {
        expect(error).toBeInstanceOf(MissingDirectory);
        expect(error).toHaveProperty('directoryId', 'hookDir');
      }
    });
  });
});
