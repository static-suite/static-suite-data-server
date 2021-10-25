"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryRunner = void 0;
const path_1 = __importDefault(require("path"));
const microtime_1 = __importDefault(require("microtime"));
const config_1 = require("@lib/config");
const store_1 = require("@lib/store");
const module_1 = require("@lib/utils/module");
const logger_1 = require("@lib/utils/logger");
const cache_1 = require("@lib/utils/cache");
const fs_1 = require("@lib/utils/fs");
const dataServer_types_1 = require("@lib/dataServer.types");
const query_types_1 = require("./query.types");
let count = 0;
const createErrorResponse = (message) => {
    logger_1.logger.error(message);
    return { error: message };
};
/**
 * @typedef {Object} QueryRunner
 * @property {Function} configure - Configure the query runner.
 * @property {Function} run - Run a query.
 */
const queryRunner = {
    /**
     * Get a list of available query IDs.
     *
     * Check any module inside config.queryDir that exports a function called "queryHandler".
     *
     * @return {Array} Array with available query IDs.
     */
    getAvailableQueryIds: () => {
        const availableQueries = [];
        if (config_1.config.queryDir) {
            const { queryDir } = config_1.config;
            const allQueryModulesRelativePath = (0, fs_1.findFilesInDir)(queryDir, '**/*.query.js');
            allQueryModulesRelativePath.forEach(queryModuleRelativePath => {
                const queryModuleAbsolutePath = path_1.default.join(queryDir, queryModuleRelativePath);
                try {
                    const queryModule = module_1.moduleHandler.get(queryModuleAbsolutePath);
                    if (queryModule.queryHandler &&
                        typeof queryModule.queryHandler === 'function') {
                        availableQueries.push(queryModuleRelativePath.split('.').slice(0, -1).join('.'));
                    }
                }
                catch (e) {
                    // noop
                }
            });
        }
        return availableQueries;
    },
    /**
     * Run a query.
     *
     * This function should not throw any error, so each consumer can handle exceptions
     * in a different way.
     *
     * @param {string} queryId - ID (filename without extension) of the query to be executed.
     * @param {Object} args - Optional object with query arguments.
     *
     * @return {Object} The result of the query.
     */
    run: (queryId, args) => {
        if (!config_1.config.queryDir) {
            return createErrorResponse('No query directory configured');
        }
        if (!queryId) {
            return createErrorResponse('No query ID received');
        }
        count += 1;
        const startDate = microtime_1.default.now();
        const argsString = JSON.stringify(args);
        logger_1.logger.debug(`#${count} Query started: "${queryId}", args "${argsString}"`);
        // Implement a query cache.
        const cacheId = `${queryId}--${argsString}`;
        const queryModulePath = `${path_1.default.join(config_1.config.queryDir, queryId)}.js`;
        let isCacheMiss = false;
        const queryCache = cache_1.cache.bin('query');
        let queryResult = queryCache.get(cacheId);
        if (!queryResult) {
            try {
                const queryModule = module_1.moduleHandler.get(queryModulePath);
                const queryResponse = queryModule.queryHandler({
                    data: store_1.store.data,
                    args,
                });
                queryResult = queryResponse?.result;
                isCacheMiss = true;
                if (config_1.config.runMode === dataServer_types_1.RunMode.PROD &&
                    queryResponse?.cacheable !== false) {
                    queryCache.set(cacheId, queryResult);
                }
            }
            catch (e) {
                // Log error and rethrow.
                logger_1.logger.error(`#${count} Query error: "${queryId}", args "${argsString}": ${e}`);
                throw e;
            }
        }
        const execTimeMs = (microtime_1.default.now() - startDate) / 1000;
        const response = {
            data: queryResult,
            metadata: {
                contentType: 'application/json',
                execTimeMs,
                // queriesPerSecond: Math.round(1000 / execTimeMs),
                cache: isCacheMiss ? query_types_1.CacheStatus.MISS : query_types_1.CacheStatus.HIT,
            },
        };
        if (queryResult && Array.isArray(queryResult)) {
            response.metadata.num = queryResult.length;
        }
        logger_1.logger.debug(`#${count} Query "${queryId}" took ${execTimeMs} ms.`);
        return response;
    },
    /**
     * Get number of queries executed.
     *
     * @return {number} Number of queries executed.
     */
    getCount: () => count,
};
exports.queryRunner = queryRunner;
