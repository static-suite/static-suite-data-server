import { configureLogger, logger, LogLevel, LogFile } from './utils/logger';
import { setConfig } from './config';
import { initWatcher } from './utils/watcher';
import { dataDirManager } from './store/dataDirManager';
import { queryRunner } from './query/queryRunner';
import { moduleHandler } from './utils/moduleHandler';
import { RunMode } from '../lib/types/runMode';

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
  }) => {
    // Configure logger.
    configureLogger(options.logLevel, options.logFile);

    console.log('kkk config', options);

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
