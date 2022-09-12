"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleManager = void 0;
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const clear_module_1 = __importDefault(require("clear-module"));
const logger_1 = require("@lib/utils/logger");
/**
 * Internal module cache.
 *
 * @remarks
 * It does not use the shared cache util since this cache must to be
 * managed only by this module, and should not be accessible nor
 * managed from the outside.
 */
const internalModuleCache = {};
/**
 * Internal resolve cache.
 *
 * @remarks
 * It does not use the shared cache util since this cache must be
 * managed only by this module, and should not be accessible nor
 * managed from the outside.
 */
const internalResolveCache = {};
/**
 * Resolves a path to a module
 *
 * @param modulePath - A path to a module
 * @returns The resolved path, or the given unresolved path if module cannot be found
 */
const resolve = (modulePath) => {
    let resolvedModulePath = internalResolveCache[modulePath];
    if (!resolvedModulePath) {
        try {
            resolvedModulePath = require.resolve(modulePath);
        }
        catch (e) {
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
exports.moduleManager = {
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
    load: (modulePath) => {
        const resolvedModulePath = resolve(modulePath);
        exports.moduleManager.remove(resolvedModulePath, { useLogger: false });
        try {
            internalModuleCache[resolvedModulePath] = require(resolvedModulePath);
        }
        catch (e) {
            logger_1.logger.error(`Module "${resolvedModulePath}" not found.`);
            throw e;
        }
        logger_1.logger.debug(`Module ${resolvedModulePath} successfully loaded.`);
        return internalModuleCache[resolvedModulePath];
    },
    /**
     * Removes a single module from Node.js cache
     *
     * @param modulePath - Path to the module to be removed
     * @param options - Object of options:
     * useLogger: Flag to use logger or not. Useful to avoid
     * "remove" log lines when this function is called from
     * other functions.
     */
    remove: (modulePath, options = { useLogger: true }) => {
        const resolvedModulePath = resolve(modulePath);
        (0, clear_module_1.default)(resolvedModulePath);
        delete internalModuleCache[resolvedModulePath];
        if (options.useLogger) {
            logger_1.logger.debug(`Module ${resolvedModulePath} successfully removed.`);
        }
    },
    /**
     * Removes several modules from Node.js cache at once
     *
     * @param regex - Regular expression to be tested again cached modules path
     */
    removeAll: (regex) => {
        const modulePathsToBeRemoved = Object.keys(require.cache).filter(modulePath => regex.test(modulePath));
        modulePathsToBeRemoved.forEach(modulePath => exports.moduleManager.remove(modulePath));
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
    get: (modulePath) => {
        const resolvedModulePath = resolve(modulePath);
        return (internalModuleCache[resolvedModulePath] ||
            exports.moduleManager.load(resolvedModulePath));
    },
};
