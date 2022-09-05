"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryRunner = void 0;
const microtime_1 = __importDefault(require("microtime"));
const config_1 = require("@lib/config");
const store_1 = require("@lib/store");
const logger_1 = require("@lib/utils/logger");
const cache_1 = require("@lib/utils/cache");
const queryManager_1 = require("./queryManager");
const query_types_1 = require("./query.types");
let count = 0;
/**
 * Creates a QueryErrorResponse object ready to be returned to clients.
 *
 * @param message - Error message
 *
 * @returns A JSON object with an error key
 *
 * @internal
 */
const createErrorResponse = (message) => {
    logger_1.logger.error(message);
    return { error: message };
};
exports.queryRunner = {
    run: (queryId, args) => {
        if (!config_1.config.queryDir) {
            return createErrorResponse('No query directory ("queryDir") configured');
        }
        if (!queryId) {
            return createErrorResponse('No query ID received');
        }
        const queryModuleInfo = queryManager_1.queryManager.getModuleGroupInfo().get(queryId);
        if (!queryModuleInfo) {
            return createErrorResponse(`Query module for ID ${queryId} not found`);
        }
        count += 1;
        const startDate = microtime_1.default.now();
        const argsString = JSON.stringify(args);
        // Implement a query cache.
        const cacheId = `${queryId}--${argsString}`;
        let isCacheMiss = false;
        const queryCache = cache_1.cache.bin('query');
        let queryResult = queryCache.get(cacheId);
        if (!queryResult) {
            try {
                const queryModule = queryModuleInfo.getModule();
                const queryResponse = queryModule.default({
                    store: store_1.store,
                    args,
                });
                queryResult = {
                    result: queryResponse?.result,
                    contentType: queryResponse?.contentType || 'application/json',
                };
                isCacheMiss = true;
                if (queryResponse?.cacheable !== false) {
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
            data: queryResult.result,
            metadata: {
                contentType: queryResult?.contentType || 'application/json',
                execTimeMs,
                cache: isCacheMiss ? query_types_1.CacheStatus.MISS : query_types_1.CacheStatus.HIT,
            },
        };
        /*     logger.debug(
          `#${count} Query "${queryId}" args "${argsString}" took ${execTimeMs} ms.`,
        ); */
        return response;
    },
    getCount: () => count,
};
