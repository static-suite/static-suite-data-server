const path = require('path');
const { config } = require('../config');
const { store } = require('../store');
const { moduleHandler } = require('../utils/moduleHandler');
const { logger } = require('../utils/logger');
const { cache } = require('../utils/cache');

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
   * Run a query.
   *
   * This function should not throw any error, so each consumer can handle exceptions
   * in a different way.
   *
   * @param {string} queryId - ID (filename without extension) of the query to be executed.
   * @param {Object} args - Optional object with query arguments.
   *
   * @return {(Array|Object|null)} The result of the query.
   */
  run: (queryId, args) => {
    if (!queryId) {
      return createError('No query ID received');
    }
    count += 1;
    const argsString = JSON.stringify(args);
    logger.debug(`#${count} Query started: "${queryId}", args "${argsString}"`);

    const startDate = Date.now();
    // Implement a query cache.
    const cacheId = `${queryId}--${argsString}`;
    const queryModulePath = `${path.join(config.queryDir, queryId)}.js`;
    let isCacheMiss = false;
    let queryResults = cache.get('query', cacheId);
    if (!queryResults) {
      try {
        const queryModule = moduleHandler.get(queryModulePath);
        const queryResponse = queryModule(store.data, args);
        queryResults = queryResponse.results;
        isCacheMiss = true;
        if (config.runMode === 'prod' && queryResponse.cacheable !== false) {
          cache.set('query', cacheId, queryResults);
        }
      } catch (e) {
        // Log error and rethrow.
        logger.error(
          `#${count} Query error: "${queryId}", args "${argsString}": ${e}`,
        );
        throw Error(e);
      }
    }
    const execTime = Date.now() - startDate;

    const response = {
      data: queryResults,
      metadata: {
        contentType: 'application/json',
        execTime,
        cache: isCacheMiss ? 'miss' : 'hit',
        num: queryResults.length,
      },
    };
    logger.debug(`#${count} Query "${queryId}" took ${execTime} ms.`);

    return response;
  },
};

module.exports.queryRunner = queryRunner;
