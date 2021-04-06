const { configureLogger, logger } = require('./utils/logger');
const { setConfig } = require('./config');
const { initWatcher } = require('./utils/watcher');
const { storeManager } = require('./store/storeManager');
const { queryRunner } = require('./query/queryRunner');
const { moduleHandler } = require('./utils/moduleHandler');

const dataServer = {
  /**
   * Init the data server.
   *
   * @param {Object} options Configuration options
   * @param {string} options.errorLogFile - Absolute path to the error log file.
   * @param {number} options.logLevelIncrement - Verbosity increment level for logs.
   * @param {string} options.dataDir - Absolute path to the directory where data is stored.
   * @param {string} options.workDir - Absolute path to the directory where work data is stored.
   * @param {string} options.queryDir - Absolute path to the directory where queries are stored.
   * @param {string} options.postProcessor - Absolute path to the post processor file.
   * @param {string} options.runMode - Run mode (dev or prod).
   *
   * @returns {Object} - An object with store, storeManager, queryRunner and logger.
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
    storeManager.loadDataDir();

    return { store: storeManager.store, storeManager, queryRunner, logger };
  },
};

module.exports.dataServer = dataServer;
