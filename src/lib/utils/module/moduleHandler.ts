/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import clearModule from 'clear-module';
import { logger } from '@lib/utils/logger';

const modules: Record<string, any> = {};

export const moduleHandler = {
  reset: (regex: RegExp): void => {
    const modulePathsToBeRemoved = Object.keys(require.cache).filter(
      modulePath => regex.test(modulePath),
    );
    modulePathsToBeRemoved.forEach(modulePath =>
      moduleHandler.remove(modulePath),
    );
  },

  load: <Type>(modulePath: string): Type => {
    moduleHandler.remove(modulePath);
    try {
      modules[modulePath] = require(modulePath);
    } catch (e) {
      logger.error(`Module "${modulePath}" not found.`);
      throw e;
    }
    logger.debug(`Module ${modulePath} successfully loaded.`);
    return modules[modulePath];
  },

  remove: (modulePath: string): void => {
    clearModule(modulePath);
    delete modules[modulePath];
    logger.debug(`Module ${modulePath} successfully removed.`);
  },

  get: <Type>(modulePath: string): Type =>
    modules[modulePath] || moduleHandler.load(modulePath),
};
