"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataServer = void 0;
const logger_1 = require("@lib/utils/logger");
const watcher_1 = require("@lib/utils/watcher");
const config_1 = require("@lib/config");
const dataDir_1 = require("@lib/store/dataDir");
const query_1 = require("@lib/query");
const moduleHandler_1 = require("@lib/utils/moduleHandler");
/* export type DataDirManager = {
  store: Store;
  loadDataDir(options?: { useCache: boolean }): DataDirManager;
  updateDataDir(): DataDirManager;
  getDataDirLastUpdate(): Date | null;
};
 */
exports.dataServer = {
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
    init: (options) => {
        // Configure logger.
        (0, logger_1.configureLogger)(options.logLevel, options.logFile);
        // Configure data server.
        (0, config_1.setConfig)({
            dataDir: options.dataDir,
            workDir: options.workDir,
            queryDir: options.queryDir,
            postProcessor: options.postProcessor,
            runMode: options.runMode,
        });
        // Init moduleHandler and load all modules (query and post processor).
        moduleHandler_1.moduleHandler.init();
        // Start watcher.
        (0, watcher_1.initWatcher)();
        // Load data from dataDir.
        dataDir_1.dataDirManager.loadDataDir({ useCache: false });
        return {
            data: dataDir_1.dataDirManager.store.data,
            dataDirManager: dataDir_1.dataDirManager,
            queryRunner: query_1.queryRunner,
            logger: logger_1.logger,
        };
    },
};
