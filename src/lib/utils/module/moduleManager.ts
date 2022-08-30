/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import clearModule from 'clear-module';
import { logger } from '@lib/utils/logger';

/**
 * Internal module cache.
 *
 * @remarks
 * It does not use the shared cache util since this cache must to be
 * managed only by this module, and should not be accessible nor
 * managed from the outside.
 */
const internalModuleCache: Record<string, any> = {};

/**
 * Internal resolve cache.
 *
 * @remarks
 * It does not use the shared cache util since this cache must be
 * managed only by this module, and should not be accessible nor
 * managed from the outside.
 */
const internalResolveCache: Record<string, any> = {};

/**
 * Resolves a path to a module
 *
 * @param modulePath - A path to a module
 * @returns The resolved path, or the passed unresolved path if module cannot be found
 */
const resolve = (modulePath: string): string => {
  let resolvedModulePath = internalResolveCache[modulePath];
  if (!resolvedModulePath) {
    try {
      resolvedModulePath = require.resolve(modulePath);
    } catch (e) {
      resolvedModulePath = modulePath;
    }
    internalResolveCache[modulePath] = resolvedModulePath;
  }
  return resolvedModulePath;
};

/**
 * Module system that manages the caching of modules.
 *
 * @remarks
 * Modules are cached by Node.js when they are required. This module handler
 * is able to remove them from Node.js cache and reload them from scratch.
 *
 * This manager is aimed at handling "user-land" modules, i.e.- modules managed
 * by users and not part of the Data Server core. Those "user-land" modules are
 * queries and hooks, so trying to manage other kind of module will throw and error.
 */
export const moduleManager = {
  /**
   * Loads a module from scratch
   *
   * @remarks
   * Removes a module from Node.js cache, and loads it from scratch.
   * If the module is not valid or not found, it logs an error and throws
   * an exception.
   *
   * @param modulePath - Path to the module to be loaded
   * @typeParam Type - Type of the module to be loaded
   *
   * @returns - The requested module
   *
   * @throws
   * An exception if the module is not valid or it cannot be loaded.
   */
  load: <Type>(modulePath: string): Type => {
    const resolvedModulePath = resolve(modulePath);
    moduleManager.remove(resolvedModulePath);
    try {
      internalModuleCache[resolvedModulePath] = require(resolvedModulePath);
    } catch (e) {
      logger.error(`Module "${resolvedModulePath}" not found.`);
      throw e;
    }
    logger.debug(`Module ${resolvedModulePath} successfully loaded.`);
    return internalModuleCache[resolvedModulePath];
  },

  /**
   * Removes a single module from Node.js cache
   *
   * @param modulePath - Path to the module to be removed
   */
  remove: (modulePath: string): void => {
    const resolvedModulePath = resolve(modulePath);
    clearModule(resolvedModulePath);
    delete internalModuleCache[resolvedModulePath];
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
      moduleManager.remove(modulePath),
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
      internalModuleCache[resolvedModulePath] ||
      moduleManager.load(resolvedModulePath)
    );
  },
};
