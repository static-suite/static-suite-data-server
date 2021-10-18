import path from 'path';
import chokidar from 'chokidar';
import { config } from '@lib/config';
import { dataDirManager } from '@lib/store/dataDir/dataDirManager';
import { RunMode } from '@lib/dataServer.types';
import { logger } from './logger';
import { moduleHandler } from './moduleHandler';

// If module is a post processor, rebuild the whole store
// so it can be re-evaluated.
const conditionallyResetStore = (filePath: string) => {
  const postProcessorDir = config.postProcessor
    ? path.dirname(config.postProcessor)
    : null;
  if (postProcessorDir && filePath.indexOf(postProcessorDir) !== -1) {
    dataDirManager.loadDataDir({ useCache: true });
    logger.info(`Re-building store done`);
  }
};

// Initialize watcher.
export const initWatcher = (): void => {
  if (
    config.runMode === RunMode.DEV &&
    (config.queryDir || config.postProcessor)
  ) {
    const paths: string[] = [];
    if (config.queryDir) {
      paths.push(config.queryDir);
    }
    if (config.postProcessor) {
      paths.push(config.postProcessor);
    }
    if (paths.length > 0) {
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
  }
};
