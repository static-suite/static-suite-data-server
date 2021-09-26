"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataServer = void 0;
const logger_1 = require("./utils/logger");
const config_1 = require("./config");
const watcher_1 = require("./utils/watcher");
const dataDirManager_1 = require("./store/dataDirManager");
const queryRunner_1 = require("./query/queryRunner");
const moduleHandler_1 = require("./utils/moduleHandler");
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
        console.log('kkk config', options);
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
        dataDirManager_1.dataDirManager.loadDataDir({ useCache: false });
        return {
            data: dataDirManager_1.dataDirManager.store.data,
            dataDirManager: dataDirManager_1.dataDirManager,
            queryRunner: queryRunner_1.queryRunner,
            logger: logger_1.logger,
        };
    },
};
