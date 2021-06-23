const path = require('path');
const chokidar = require('chokidar');
const { config } = require('../config');
const { logger } = require('./logger');
const { dataDirManager } = require('../store/dataDirManager');
const { moduleHandler } = require('./moduleHandler');

// If module is a post processor, rebuild the whole store
// so it can be evaluated again.
const conditionallyResetStore = filePath => {
  const postProcessorDir = config.postProcessor
    ? path.dirname(config.postProcessor)
    : null;
  if (postProcessorDir && filePath.indexOf(postProcessorDir) !== -1) {
    dataDirManager.loadDataDir({ useCache: true });
    logger.info(`Re-building store done`);
  }
};

// Initialize watcher.
const initWatcher = () => {
  if (config.runMode === 'dev' && (config.queryDir || config.postProcessor)) {
    const paths = [config.queryDir, config.postProcessor].filter(
      filePath => !!filePath,
    );
    const watcher = chokidar.watch(paths, {
      ignored: /(^|[/\\])\../,
      persistent: true,
    });

    // Add event listeners. None of these events need to clear any query cache,
    // since they only run on dev mode, where caches are disabled. They only
    // need to rebuild the store if a post processor changes.
    watcher.on('ready', () => {
      logger.debug(`Watcher listening for changes on ${paths.join(',')}`);
      watcher
        .on('add', filePath => {
          logger.debug(`File ${filePath} added`);
          moduleHandler.load(filePath);
          conditionallyResetStore(filePath);
          logger.info(`Re-building development modules done`);
        })
        .on('change', filePath => {
          logger.debug(`File ${filePath} changed`);
          moduleHandler.init();
          conditionallyResetStore(filePath);
          logger.info(`Re-building development modules done`);
        })
        .on('unlink', filePath => {
          logger.debug(`File ${filePath} removed`);
          moduleHandler.remove(filePath);
          conditionallyResetStore(filePath);
          logger.info(`Re-building development modules done`);
        });
    });
  }
};

module.exports = { initWatcher };
