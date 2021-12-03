"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheStatus = exports.LogLevel = exports.RunMode = exports.dataServer = void 0;
const logger_1 = require("@lib/utils/logger");
const logger_types_1 = require("@lib/utils/logger/logger.types");
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return logger_types_1.LogLevel; } });
const watcher_1 = require("@lib/watcher");
const config_1 = require("@lib/config");
const dataDir_1 = require("@lib/store/dataDir");
const store_1 = require("@lib/store");
const query_1 = require("@lib/query");
const query_types_1 = require("@lib/query/query.types");
Object.defineProperty(exports, "CacheStatus", { enumerable: true, get: function () { return query_types_1.CacheStatus; } });
const dataServer_types_1 = require("./dataServer.types");
Object.defineProperty(exports, "RunMode", { enumerable: true, get: function () { return dataServer_types_1.RunMode; } });
/**
 * The Data Server instance.
 *
 * @public
 */
const dataServer = {
    /**
     * Initializes the Data Server.
     *
     * @param options - Configuration options
     *
     * @returns An object with the data store and the queryRunner service.
     */
    init: (options) => {
        // Configure logger.
        (0, logger_1.configureLogger)(options.logLevel, options.logFile);
        // Configure data server.
        const config = (0, config_1.setConfig)({
            dataDir: options.dataDir,
            workDir: options.workDir,
            queryDir: options.queryDir,
            hookDir: options.hookDir,
            runMode: options.runMode,
        });
        // Start watcher.
        if (config.runMode === dataServer_types_1.RunMode.DEV) {
            (0, watcher_1.initWatcher)();
        }
        // Load data from dataDir.
        dataDir_1.dataDirManager.load({ incremental: false });
        return {
            store: store_1.store,
            queryRunner: query_1.queryRunner,
        };
    },
};
exports.dataServer = dataServer;
