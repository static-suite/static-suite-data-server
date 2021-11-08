import microtime from 'microtime';
import { config } from '@lib/config';
import { store } from '@lib/store';
import { logger } from '@lib/utils/logger';
import { cache } from '@lib/utils/cache';
import { RunMode } from '@lib/dataServer.types';
import { queryManager } from './queryManager';
import {
  QueryRunner,
  CacheStatus,
  QueryResponse,
  QueryErrorResponse,
} from './query.types';

let count = 0;

/**
 * CReates a QueryErrorResponse object ready to be returned to clients.
 *
 * @param message - Error message
 *
 * @returns A JSON object with an error key
 *
 * @internal
 */
const createErrorResponse = (message: string): QueryErrorResponse => {
  logger.error(message);
  return { error: message };
};

/**
 * A service to handle the execution of queries
 */
export const queryRunner: QueryRunner = {
  /**
   * Runs a query and returns its results with metadata.
   *
   * @remarks
   * It checks several validations before a query is run, and then it tries to get
   * the query result from cache. If cache is empty, query is executed and saved
   * in the cache.
   *
   * It logs an error and throws an exception if any problem occurs during the
   * query execution.
   *
   * @param queryId - ID (filename without extension and suffix) of the query
   * to be executed.
   * @param args - Optional object with query arguments.
   *
   * @returns The result of the query as a JSON object with data and metadata keys.
   *
   * @throws
   * Exception thrown if any problem occurs during the query execution.
   */
  run: (
    queryId: string,
    args: Record<string, string>,
  ): QueryResponse | QueryErrorResponse => {
    if (!config.queryDir) {
      return createErrorResponse('No query directory ("queryDir") configured');
    }
    if (!queryId) {
      return createErrorResponse('No query ID received');
    }
    const queryModuleInfo = queryManager.getModuleGroupInfo().get(queryId);
    if (!queryModuleInfo) {
      return createErrorResponse(`Query module for ID ${queryId} not found`);
    }

    count += 1;
    const startDate = microtime.now();
    const argsString = JSON.stringify(args);
    logger.debug(`#${count} Query started: "${queryId}", args "${argsString}"`);

    // Implement a query cache.
    const cacheId = `${queryId}--${argsString}`;
    let isCacheMiss = false;
    const queryCache = cache.bin('query');
    let queryResult = RunMode.PROD && queryCache.get(cacheId);
    if (!queryResult) {
      try {
        const queryModule = queryModuleInfo.getModule();
        const queryResponse = queryModule.queryHandler({
          data: store.data,
          args,
        });
        queryResult = queryResponse?.result;
        isCacheMiss = true;
        if (
          config.runMode === RunMode.PROD &&
          queryResponse?.cacheable !== false
        ) {
          queryCache.set(cacheId, queryResult);
        }
      } catch (e) {
        // Log error and rethrow.
        logger.error(
          `#${count} Query error: "${queryId}", args "${argsString}": ${e}`,
        );
        throw e;
      }
    }
    const execTimeMs = (microtime.now() - startDate) / 1000;
    const response: QueryResponse = {
      data: queryResult,
      metadata: {
        contentType: 'application/json',
        execTimeMs,
        // queriesPerSecond: Math.round(1000 / execTimeMs),
        cache: isCacheMiss ? CacheStatus.MISS : CacheStatus.HIT,
      },
    };
    if (queryResult && Array.isArray(queryResult)) {
      response.metadata.num = queryResult.length;
    }

    logger.debug(`#${count} Query "${queryId}" took ${execTimeMs} ms.`);

    return response;
  },

  /**
   * Gets number of executed queries.
   *
   * @returns Number of executed queries.
   */
  getCount: (): number => count,
};
