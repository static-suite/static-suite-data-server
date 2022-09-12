import microtime from 'microtime';
import { config } from '@lib/config';
import { store } from '@lib/store';
import { logger } from '@lib/utils/logger';
import { cache } from '@lib/utils/cache';
import { queryManager } from './queryManager';
import {
  QueryModuleResult,
  QueryRunner,
  CacheStatus,
  QueryErrorResponse,
  QuerySuccessfulResponse,
} from './query.types';

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
const createErrorResponse = (message: string): QueryErrorResponse => {
  logger.error(message);
  return { error: message };
};

export const queryRunner: QueryRunner = {
  run: (queryId, args): QuerySuccessfulResponse | QueryErrorResponse => {
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

    // Implement a query cache.
    const cacheId = `${queryId}--${argsString}`;
    let isCacheMiss = false;
    const queryCache = cache.bin<QueryModuleResult>('query');
    let queryResult = queryCache.get(cacheId);
    if (!queryResult) {
      try {
        const queryModule = queryModuleInfo.getModule();
        const queryResponse = queryModule.default({
          store,
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
      } catch (e) {
        // Log error and rethrow.
        logger.error(
          `#${count} Query error: "${queryId}", args "${argsString}": ${e}`,
        );
        throw e;
      }
    }
    const execTimeMs = (microtime.now() - startDate) / 1000;
    const response: QuerySuccessfulResponse = {
      data: queryResult.result,
      metadata: {
        contentType: queryResult?.contentType || 'application/json',
        execTimeMs,
        cache: isCacheMiss ? CacheStatus.MISS : CacheStatus.HIT,
      },
    };

    /*     logger.debug(
      `#${count} Query "${queryId}" args "${argsString}" took ${execTimeMs} ms.`,
    ); */

    return response;
  },

  getCount: (): number => count,
};
