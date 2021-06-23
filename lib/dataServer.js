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
   * @param {string} options.errorLogFile - Path to the error log file.
   * @param {number} options.logLevelIncrement - Verbosity increment level for logs.
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
      errorLogFile: options.errorLogFile,
      logLevelIncrement: options.logLevelIncrement,
    });

    // Configure data server.
    const dataServerOptions = { ...options };
    delete dataServerOptions.errorLogFile;
    delete dataServerOptions.logLevelIncrement;
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
