/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import path from 'path';
import { config } from '@lib/config';
import { logger } from '@lib/utils/logger';
import { findFilesInDir } from '@lib/utils/fs';

const modules: Record<string, any> = {};

export const moduleHandler = {
  init: (): void => {
    if (config.queryDir) {
      const { queryDir } = config;
      const allQueryModules = findFilesInDir(queryDir, '**/*.js');
      allQueryModules.forEach(queryModule => {
        const modulePath = path.join(queryDir, queryModule);
        // Use https://www.npmjs.com/package/decache as an alternative.
        delete require.cache[require.resolve(modulePath)];
        moduleHandler.load(modulePath);
      });
    }

    if (config.postProcessor) {
      delete require.cache[require.resolve(config.postProcessor)];
      moduleHandler.load(config.postProcessor);
    }
  },

  load: <Type>(modulePath: string): Type => {
    delete modules[modulePath];
    modules[modulePath] = require(modulePath);
    if (!modules[modulePath]) {
      throw Error(`Query "${modulePath}" not loaded.`);
    }
    logger.debug(`Load for ${modulePath} done.`);
    return modules[modulePath];
  },

  remove: (modulePath: string): void => {
    logger.debug(`Remove for ${modulePath} done.`);
    delete require.cache[require.resolve(modulePath)];
    delete modules[modulePath];
  },

  get: <Type>(modulePath: string): Type =>
    modules[modulePath] || moduleHandler.load(modulePath),
};
