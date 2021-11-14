import { Logger, LogLevel, LogFile } from '@lib/utils/logger/logger.types';
import { QueryRunner } from '@lib/query/query.types';

/* * @param options.logFile - .
* @param options.logFileLevel - Log level for log file.
* @param options.dataDir - Path to the directory where data is stored.
* @param options.workDir - Path to the directory where work data is stored.
* @param options.queryDir - Path to the directory where queries are stored.
* @param options.hookDir - Path to the directory where hooks are stored.
* @param options.runMode - Run mode (dev or prod).


 */
export type DataServerInitOptions = {
  /**
   * Log level. Optional. @see {@link LogLevel}
   */
  logLevel?: LogLevel;

  /**
   * Path to the log file. Optional. @see {@link LogFile}
   */
  logFile?: LogFile;

  /**
   * Log level for the log file. Optional. @see {@link LogLevel}
   */
  logFileLevel?: LogLevel;

  /**
   * Path to the directory where data is stored.
   */
  dataDir: string;

  /**
   * Path to the directory where work data is stored. Optional.
   */
  workDir?: string;

  /**
   * Path to the directory where queries are stored. Optional.
   */
  queryDir?: string;

  /**
   * Path to the directory where hooks are stored. Optional.
   */
  hookDir?: string;

  /**
   * Run mode (dev or prod).
   */
  runMode: RunMode;
};

/**
 * Available run modes: dev or prod
 */
export enum RunMode {
  DEV = 'dev',
  PROD = 'prod',
}

/**
 * A helper to get RunMode type as strings. @see {@link RunMode}.
 */
export type RunModeStrings = keyof typeof RunMode;

/**
 * Data returned by Data Server once initialized.
 */
export type DataServerReturn = {
  /**
   * The data store.
   */
  data: any;

  /**
   * The query runner, to be able to run queries on demand.
   */
  queryRunner: QueryRunner;

  /**
   * The logger service.
   */
  logger: Logger;
};
