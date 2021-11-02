import { configureLogger, logger } from '@lib/utils/logger';
import { LogLevel, LogFile } from '@lib/utils/logger/logger.types';
import { initWatcher } from '@lib/watcher';
import { setConfig } from '@lib/config';
import { dataDirManager } from '@lib/store/dataDir';
import { store } from '@lib/store';
import { queryRunner } from '@lib/query';
import { RunMode, DataServerReturn } from './dataServer.types';

export const dataServer = {
  /**
   * Init the data server.
   *
   * @param {Object} options Configuration options
   * @param {string} options.logLevel - Log level.
   * @param {string} options.logFile - Path to log file.
   * @param {string} options.logFileLevel - Log level for log file.
   * @param {string} options.dataDir - Path to the directory where data is stored.
   * @param {string} options.workDir - Path to the directory where work data is stored.
   * @param {string} options.queryDir - Path to the directory where queries are stored.
   * @param {string} options.hookDir - Path to the directory where hooks are stored.
   * @param {string} options.runMode - Run mode (dev or prod).
   *
   * @return {Object} - An object with store, dataDirManager, queryRunner and logger.
   */
  init: (options: {
    logLevel: LogLevel;
    logFile?: LogFile;
    dataDir: string;
    workDir?: string;
    queryDir?: string;
    hookDir?: string;
    runMode: RunMode;
  }): DataServerReturn => {
    // Configure logger.
    configureLogger(options.logLevel, options.logFile);

    // Configure data server.
    const config = setConfig({
      dataDir: options.dataDir,
      workDir: options.workDir,
      queryDir: options.queryDir,
      hookDir: options.hookDir,
      runMode: options.runMode,
    });

    // Start watcher.
    if (config.runMode === RunMode.DEV) {
      initWatcher();
    }

    // Load data from dataDir.
    dataDirManager.load({ incremental: false });

    return {
      data: store.data,
      dataDirManager,
      queryRunner,
      logger,
    };
  },
};
