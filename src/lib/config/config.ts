import fs from 'fs';
import path from 'path';
import { RunMode } from '../dataServer.types';
import { hasKey } from '../utils/object';
import { ConfigOptions, NonSanitizedConfigOptions } from './config.types';
import {
  InvalidRunMode,
  MissingDirectory,
  NonWritableDirectory,
  MissingRequiredOption,
} from './error';

const config: ConfigOptions = Object.create(null); // no inherited properties

/**
 * Configures the data server.
 *
 * @remarks
 * It validates provided configuration and returns a sanitized and immutable
 * configuration object. It throws several errors if validation is not passing.
 *
 * @param options - Configuration options, @see {@link ConfigOptions}
 *
 * @returns - The sanitized and immutable configuration object.
 *
 * @throws {@link MissingRequiredOption}
 * Exception thrown if the dataDir or runMode are not provided.
 *
 * @throws {@link MissingDirectory}
 * Exception thrown if any of the provided paths (dataDir, workDir,
 * queryDir, hookDir or taskDir) is not found.
 *
 * @throws {@link InvalidRunMode}
 * Exception thrown if runMode is not valid.
 */
const setConfig = (options: NonSanitizedConfigOptions): ConfigOptions => {
  const localOptions = options;
  // Check that required options are provided.
  // Since this method is publicly accessible at runtime, it is not
  // possible to rely on TypeScript type safety.
  if (!localOptions.dataDir) {
    throw new MissingRequiredOption('dataDir');
  }
  localOptions.dataDir = path.resolve(localOptions.dataDir);
  if (
    !fs.existsSync(localOptions.dataDir) ||
    !fs.lstatSync(localOptions.dataDir).isDirectory()
  ) {
    throw new MissingDirectory('dataDir', localOptions.dataDir);
  }
  // fs.realpathSync() throws an error if path does not exist.
  localOptions.dataDir = fs.realpathSync(localOptions.dataDir);

  if (localOptions.workDir) {
    localOptions.workDir = path.resolve(localOptions.workDir);
    if (
      !fs.existsSync(localOptions.workDir) ||
      !fs.lstatSync(localOptions.workDir).isDirectory()
    ) {
      throw new MissingDirectory('workDir', localOptions.workDir);
    }
    // fs.realpathSync() throws an error if path does not exist.
    localOptions.workDir = fs.realpathSync(localOptions.workDir);
  }

  if (localOptions.queryDir) {
    localOptions.queryDir = path.resolve(localOptions.queryDir);
    if (
      !fs.existsSync(localOptions.queryDir) ||
      !fs.lstatSync(localOptions.queryDir).isDirectory()
    ) {
      throw new MissingDirectory('queryDir', localOptions.queryDir);
    }
    // fs.realpathSync() throws an error if path does not exist.
    localOptions.queryDir = fs.realpathSync(localOptions.queryDir);
  }

  if (localOptions.hookDir) {
    localOptions.hookDir = path.resolve(localOptions.hookDir);
    if (
      !fs.existsSync(localOptions.hookDir) ||
      !fs.lstatSync(localOptions.hookDir).isDirectory()
    ) {
      throw new MissingDirectory('hookDir', localOptions.hookDir);
    }
    // fs.realpathSync() throws an error if path does not exist.
    localOptions.hookDir = fs.realpathSync(localOptions.hookDir);
  }

  if (localOptions.taskDir) {
    localOptions.taskDir = path.resolve(localOptions.taskDir);
    if (
      !fs.existsSync(localOptions.taskDir) ||
      !fs.lstatSync(localOptions.taskDir).isDirectory()
    ) {
      throw new MissingDirectory('taskDir', localOptions.taskDir);
    }
    // fs.realpathSync() throws an error if path does not exist.
    localOptions.taskDir = fs.realpathSync(localOptions.taskDir);
  }

  if (localOptions.dumpDir) {
    localOptions.dumpDir = path.resolve(localOptions.dumpDir);
    if (
      !fs.existsSync(localOptions.dumpDir) ||
      !fs.lstatSync(localOptions.dumpDir).isDirectory()
    ) {
      throw new MissingDirectory('dumpDir', localOptions.dumpDir);
    }
    try {
      fs.accessSync(localOptions.dumpDir, fs.constants.W_OK);
    } catch (e) {
      throw new NonWritableDirectory('dumpDir', localOptions.dumpDir);
    }
    // fs.realpathSync() throws an error if path does not exist.
    localOptions.dumpDir = fs.realpathSync(localOptions.dumpDir);
  }

  if (!localOptions.runMode) {
    localOptions.runMode = RunMode.PROD;
  }
  if (!Object.values(RunMode).includes(localOptions.runMode)) {
    throw new InvalidRunMode(localOptions.runMode);
  }

  Object.keys(localOptions).forEach(key => {
    if (hasKey(localOptions, key)) {
      Object.defineProperty(config, key, {
        enumerable: true,
        configurable: false,
        writable: false,
        // Remove leading slash from all directories.
        value:
          key === 'runMode'
            ? localOptions[key]
            : localOptions[key]?.replace(/\/$/, ''),
      });
    }
  });
  return Object.freeze(config);
};

export { config, setConfig };
