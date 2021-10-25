import path from 'path';
import microtime from 'microtime';
import { config } from '@lib/config';
import { store } from '@lib/store';
import { moduleHandler } from '@lib/utils/module';
import { logger } from '@lib/utils/logger';
import { cache } from '@lib/utils/cache';
import { findFilesInDir } from '@lib/utils/fs';
import { RunMode } from '@lib/dataServer.types';
import {
  QueryRunner,
  QueryModule,
  CacheStatus,
  QueryResponse,
  QueryErrorResponse,
} from './query.types';

let count = 0;

const createErrorResponse = (message: string): QueryErrorResponse => {
  logger.error(message);
  return { error: message };
};

/**
 * QueryRunner
 * @property {Function} configure - Configure the query runner.
 * @property {Function} run - Run a query.
 */
const queryRunner: QueryRunner = {
  /**
   * Get a list of available query IDs.
   *
   * Check any module inside config.queryDir that exports a function called "queryHandler".
   *
   * @returns Array with available query IDs.
   */
  getAvailableQueryIds: (): string[] => {
    const availableQueries: string[] = [];

    if (config.queryDir) {
      const { queryDir } = config;
      const allQueryModulesRelativePath = findFilesInDir(
        queryDir,
        '**/*.query.js',
      );

      allQueryModulesRelativePath.forEach(queryModuleRelativePath => {
        const queryModuleAbsolutePath = path.join(
          queryDir,
          queryModuleRelativePath,
        );

        try {
          const queryModule = moduleHandler.get<QueryModule>(
            queryModuleAbsolutePath,
          );
          if (
            queryModule.queryHandler &&
            typeof queryModule.queryHandler === 'function'
          ) {
            availableQueries.push(
              queryModuleRelativePath.split('.').slice(0, -1).join('.'),
            );
          }
        } catch (e) {
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
   * @param queryId - ID (filename without extension) of the query to be executed.
   * @param args - Optional object with query arguments.
   *
   * @returns The result of the query.
   */
  run: (
    queryId: string,
    args: Record<string, string>,
  ): QueryResponse | QueryErrorResponse => {
    if (!config.queryDir) {
      return createErrorResponse('No query directory configured');
    }
    if (!queryId) {
      return createErrorResponse('No query ID received');
    }

    count += 1;
    const startDate = microtime.now();
    const argsString = JSON.stringify(args);
    logger.debug(`#${count} Query started: "${queryId}", args "${argsString}"`);

    // Implement a query cache.
    const cacheId = `${queryId}--${argsString}`;
    const queryModulePath = `${path.join(config.queryDir, queryId)}.js`;
    let isCacheMiss = false;
    const queryCache = cache.bin('query');
    let queryResult = queryCache.get(cacheId);
    if (!queryResult) {
      try {
        const queryModule = moduleHandler.get<QueryModule>(queryModulePath);
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
   * Get number of queries executed.
   *
   * @return {number} Number of queries executed.
   */
  getCount: (): number => count,
};

export { queryRunner };
