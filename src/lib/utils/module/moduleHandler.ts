/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import clearModule from 'clear-module';
// import decache from 'decache';
import { logger } from '@lib/utils/logger';

/**
 * Internal module cache.
 */
const modules: Record<string, any> = {};

/**
 * Resolves a path to a module
 *
 * @param modulePath - A path to a module
 * @returns The resolved path, or the passed unresolved path if module cannot be found
 */
const resolve = (modulePath: string): string => {
  try {
    return require.resolve(modulePath);
  } catch (e) {
    return modulePath;
  }
};
/**
 * Module system that manages the caching of modules.
 *
 * Modules are cached by Node.js when they are required. This module handler
 * is able to remove them from Node.js cache and reload them from scratch.
 */
export const moduleHandler = {
  /**
   * Loads a module from scratch
   *
   * @remarks
   * Removes a module from Node.js cache, and loads it from scratch.
   * If module is not found, it logs an error and throws an exception.
   *
   * @param modulePath - Path to the module to be loaded
   * @typeParam Type - Type of the module to be loaded
   *
   * @returns - The requested module
   *
   * @throws
   * An exception if the module cannot be loaded.
   */
  load: <Type>(modulePath: string): Type => {
    const resolvedModulePath = resolve(modulePath);
    moduleHandler.remove(resolvedModulePath);
    try {
      modules[resolvedModulePath] = require(resolvedModulePath);
    } catch (e) {
      logger.error(`Module "${resolvedModulePath}" not found.`);
      throw e;
    }
    logger.debug(`Module ${resolvedModulePath} successfully loaded.`);
    return modules[resolvedModulePath];
  },

  /**
   * Removes a single module from Node.js cache
   *
   * @param modulePath - Path to the module to be removed
   */
  remove: (modulePath: string): void => {
    const resolvedModulePath = resolve(modulePath);
    clearModule(resolvedModulePath);
    delete modules[resolvedModulePath];
    logger.debug(`Module ${resolvedModulePath} successfully removed.`);
  },

  /**
   * Removes several modules from Node.js cache at once
   *
   * @param regex - Regular expression to be tested again cached modules path
   */
  removeAll: (regex: RegExp): void => {
    const modulePathsToBeRemoved = Object.keys(require.cache).filter(
      modulePath => regex.test(modulePath),
    );
    modulePathsToBeRemoved.forEach(modulePath =>
      moduleHandler.remove(modulePath),
    );
  },

  /**
   * Gets a module from cache or loads it from scratch
   *
   * @remarks
   * If module is not found, logs an error and throws an exception.
   *
   * @param modulePath - Path to the module to be loaded
   * @typeParam Type - Type of the module to be loaded
   *
   * @returns - The requested module
   *
   * @throws
   * An exception if the module cannot be loaded.
   */
  get: <Type>(modulePath: string): Type => {
    const resolvedModulePath = resolve(modulePath);
    return (
      modules[resolvedModulePath] || moduleHandler.load(resolvedModulePath)
    );
  },
};
