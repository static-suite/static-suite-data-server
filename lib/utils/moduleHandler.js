/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const path = require('path');
const decache = require('decache');
const { logger } = require('./logger');
const { config } = require('../config');
const { findFilesInDir } = require('./fsUtils');

const modules = {};

const moduleHandler = {
  init: () => {
    if (config.queryDir) {
      const allQueryModules = findFilesInDir(config.queryDir, '**/*.js');
      allQueryModules.forEach(queryModule => {
        const modulePath = path.join(config.queryDir, queryModule);
        decache(modulePath);
        moduleHandler.load(modulePath);
      });
    }

    if (config.postProcessor) {
      decache(config.postProcessor);
      moduleHandler.load(config.postProcessor);
    }
  },
  load: modulePath => {
    delete modules[modulePath];
    modules[modulePath] = require(modulePath);
    if (!modules[modulePath]) {
      throw Error(`Query "${modulePath}" not loaded.`);
    }
    logger.debug(`Load for ${modulePath} done.`);
    return modules[modulePath];
  },

  remove: modulePath => {
    logger.debug(`Remove for ${modulePath} done.`);
    decache(modulePath);
    delete modules[modulePath];
  },

  get: modulePath => modules[modulePath] || moduleHandler.load(modulePath),
};

module.exports.moduleHandler = moduleHandler;
