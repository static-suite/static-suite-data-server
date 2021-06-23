const path = require('path');
const microtime = require('microtime');
const { config } = require('../config');
const { store } = require('../store');
const { moduleHandler } = require('../utils/moduleHandler');
const { logger } = require('../utils/logger');
const { cache } = require('../utils/cache');
const { findFilesInDir } = require('../utils/fsUtils');
// const { getArgs } = require('../utils/functionUtils');

let count = 0;

const createError = message => {
  logger.error(message);
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

    const allQueryModulesRelativePath = findFilesInDir(
      config.queryDir,
      '**/*.js',
    );

    allQueryModulesRelativePath.forEach(queryModuleRelativePath => {
      const queryModuleAbsolutePath = path.join(
        config.queryDir,
        queryModuleRelativePath,
      );

      try {
        const queryModule = moduleHandler.get(queryModuleAbsolutePath);
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
    if (!queryId) {
      return createError('No query ID received');
    }
    count += 1;
    const startDate = microtime.now();
    const argsString = JSON.stringify(args);
    logger.debug(`#${count} Query started: "${queryId}", args "${argsString}"`);

    // Implement a query cache.
    const cacheId = `${queryId}--${argsString}`;
    const queryModulePath = `${path.join(config.queryDir, queryId)}.js`;
    let isCacheMiss = false;
    let queryResults = cache.get('query', cacheId);
    if (!queryResults) {
      try {
        const queryModule = moduleHandler.get(queryModulePath);
        const queryResponse = queryModule.queryHandler({
          data: store.data,
          args,
        });
        queryResults = queryResponse?.results;
        isCacheMiss = true;
        if (config.runMode === 'prod' && queryResponse?.cacheable !== false) {
          cache.set('query', cacheId, queryResults);
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
    const response = {
      data: queryResults || null,
      metadata: {
        contentType: 'application/json',
        execTimeMs,
        queriesPerSecond: Math.round(1000 / execTimeMs),
        cache: isCacheMiss ? 'miss' : 'hit',
      },
    };
    if (queryResults && Array.isArray(queryResults)) {
      response.metadata.num = queryResults.length;
    }

    logger.debug(`#${count} Query "${queryId}" took ${execTimeMs} ms.`);

    return response;
  },

  /**
   * Get number of queries executed.
   *
   * @return {number} Number of queries executed.
   */
  getCount: () => count,
};

module.exports.queryRunner = queryRunner;
