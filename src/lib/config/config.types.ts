import { RunMode } from '@lib/dataServer.types';

/**
 * Configuration options.
 *
 * @param dataDir - Path to the directory where data is stored.
 * @param workDir - Path to the directory where work data is stored. Optional.
 * @param queryDir - Path to the directory where queries are stored. Optional.
 * @param hookDir - Path to the directory where hooks are stored. Optional.
 * @param runMode - Run mode (dev or prod).
 */
export type ConfigOptions = {
  dataDir: string;
  workDir?: string;
  queryDir?: string;
  hookDir?: string;
  runMode: RunMode;
};
