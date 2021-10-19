import { configureLogger, logger, LogLevel, LogFile } from '@lib/utils/logger';
import { initWatcher } from '@lib/utils/watcher';
import { setConfig } from '@lib/config';
import { dataDirManager } from '@lib/store/dataDir';
import { queryRunner } from '@lib/query';
import { moduleHandler } from '@lib/utils/moduleHandler';
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
   * @param {string} options.postProcessor - Path to the post processor file.
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
    postProcessor?: string;
    runMode: RunMode;
  }): DataServerReturn => {
    // Configure logger.
    configureLogger(options.logLevel, options.logFile);

    // Configure data server.
    setConfig({
      dataDir: options.dataDir,
      workDir: options.workDir,
      queryDir: options.queryDir,
      postProcessor: options.postProcessor,
      runMode: options.runMode,
    });

    // Init moduleHandler and load all modules (query and post processor).
    moduleHandler.init();

    // Start watcher.
    initWatcher();

    // Load data from dataDir.
    dataDirManager.loadDataDir({ useCache: false });

    return {
      data: dataDirManager.store.data,
      dataDirManager,
      queryRunner,
      logger,
    };
  },
};
