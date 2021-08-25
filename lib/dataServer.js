const { configureLogger, logger } = require('./utils/logger');
const { setConfig } = require('./config');
const { initWatcher } = require('./utils/watcher');
const { dataDirManager } = require('./store/dataDirManager');
const { queryRunner } = require('./query/queryRunner');
const { moduleHandler } = require('./utils/moduleHandler');

const dataServer = {
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
  init: (options = {}) => {
    // Configure logger.
    configureLogger({
      level: options.logLevel,
      logFile: {
        path: options.logFile,
        level: options.logFileLevel,
      },
    });

    // Configure data server.
    const dataServerOptions = { ...options };
    delete dataServerOptions.logFile;
    delete dataServerOptions.logLevel;
    setConfig(dataServerOptions);

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

module.exports.dataServer = dataServer;
