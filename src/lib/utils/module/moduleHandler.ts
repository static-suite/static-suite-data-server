/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import path from 'path';
import { config } from '@lib/config';
import { logger } from '@lib/utils/logger';
import { findFilesInDir } from '@lib/utils/fs';

export const moduleHandler = {
  init: (): void => {
    if (config.queryDir) {
      const { queryDir } = config;
      const allQueryModules = findFilesInDir(queryDir, '**/*.query.js');
      allQueryModules.forEach(queryModule => {
        const modulePath = path.join(queryDir, queryModule);
        moduleHandler.load(modulePath);
      });
    }

    if (config.postProcessor) {
      moduleHandler.load(config.postProcessor);
    }
  },

  load: <Type>(modulePath: string): Type => {
    moduleHandler.remove(modulePath);
    delete require.cache[require.resolve(modulePath)];
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require(modulePath);
    if (!module) {
      throw Error(`Query "${modulePath}" not loaded.`);
    }
    logger.debug(`Load for ${modulePath} done.`);
    return module;
  },

  remove: (modulePath: string): void => {
    logger.debug(`Remove for ${modulePath} done.`);
    // Use https://www.npmjs.com/package/decache as an alternative.
    delete require.cache[require.resolve(modulePath)];
  },

  get: <Type>(modulePath: string): Type =>
    require.cache[require.resolve(modulePath)] || require(modulePath),
};
