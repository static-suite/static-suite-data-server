import fs from 'fs';
import { resolve } from 'path';
import { hasKey } from '../utils/objectUtils';
import { RunMode } from '../types/runMode';

type Config = {
  dataDir: string;
  workDir?: string;
  queryDir?: string;
  postProcessor?: string;
  runMode: RunMode;
};

export const config: Config = Object.create(null); // no inherited properties

/**
 * Configure the data server.
 *
 * @param {Object} options Configuration options
 * @param {string} options.dataDir - Relative path to the directory where data is stored.
 * @param {string} options.workDir - Relative path to the directory where work data is stored.
 * @param {string} options.queryDir - Relative path to the directory where queries are stored.
 * @param {string} options.postProcessor - Relative path to the post processor module.
 * @param {string} options.runMode - Run mode (dev or prod).
 *
 * @return {Object} - The config object.
 */
export const setConfig = (options: Config): Config => {
  // Check that required options are provided
  if (!options.dataDir) {
    throw Error('Required option not provided: "dataDir".');
  }
  options.dataDir = resolve(options.dataDir);
  if (
    !fs.existsSync(options.dataDir) ||
    !fs.lstatSync(options.dataDir).isDirectory()
  ) {
    throw Error(`Cannot find dataDir directory: "${options.dataDir}"`);
  }

  if (options.workDir) {
    options.workDir = resolve(options.workDir);
    if (
      !fs.existsSync(options.workDir) ||
      !fs.lstatSync(options.workDir).isDirectory()
    ) {
      throw Error(`Cannot find workDir directory: "${options.workDir}"`);
    }
  }

  if (options.queryDir) {
    options.queryDir = resolve(options.queryDir);
    if (
      !fs.existsSync(options.queryDir) ||
      !fs.lstatSync(options.queryDir).isDirectory()
    ) {
      throw Error(`Cannot find queryDir directory: ${options.queryDir}`);
    }
  }

  if (options.postProcessor) {
    options.postProcessor = resolve(options.postProcessor);
    if (!fs.existsSync(options.postProcessor)) {
      throw Error(`Cannot find postProcessor module: ${options.postProcessor}`);
    }
  }

  if (!options.runMode) {
    throw Error('Required option not provided: "runMode"');
  }
  if (!Object.values(RunMode).includes(options.runMode)) {
    throw Error(
      `Invalid value provided for "runMode": "${
        options.runMode
      }". Valid options are ${Object.values(RunMode).join(' or ')}`,
    );
  }

  Object.keys(options).forEach(key => {
    if (hasKey(options, key)) {
      Object.defineProperty(config, key, {
        enumerable: true,
        configurable: false,
        writable: false,
        // Remove leading slash from all directories.
        value:
          key === 'runMode' ? options[key] : options[key]?.replace(/\/$/, ''),
      });
    }
  });
  return config;
};
