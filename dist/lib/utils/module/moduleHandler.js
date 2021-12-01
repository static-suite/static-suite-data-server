"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleHandler = void 0;
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const clear_module_1 = __importDefault(require("clear-module"));
const logger_1 = require("@lib/utils/logger");
const modules = {};
/**
 * Module system that manages the caching of modules.
 *
 * Modules are cached by Node.js when they are required. This module handler
 * is able to remove them from Node.js cache and reload them from scratch.
 */
exports.moduleHandler = {
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
    load: (modulePath) => {
        const resolvedModulePath = require.resolve(modulePath);
        exports.moduleHandler.remove(resolvedModulePath);
        try {
            modules[resolvedModulePath] = require(resolvedModulePath);
        }
        catch (e) {
            logger_1.logger.error(`Module "${resolvedModulePath}" not found.`);
            throw e;
        }
        logger_1.logger.debug(`Module ${resolvedModulePath} successfully loaded.`);
        return modules[resolvedModulePath];
    },
    /**
     * Removes a single module from Node.js cache
     *
     * @param modulePath - Path to the module to be removed
     */
    remove: (modulePath) => {
        const resolvedModulePath = require.resolve(modulePath);
        (0, clear_module_1.default)(modulePath);
        delete modules[resolvedModulePath];
        logger_1.logger.debug(`Module ${resolvedModulePath} successfully removed.`);
    },
    /**
     * Removes several modules from Node.js cache at once
     *
     * @param regex - Regular expression to be tested again cached modules path
     */
    removeAll: (regex) => {
        const modulePathsToBeRemoved = Object.keys(require.cache).filter(modulePath => regex.test(modulePath));
        modulePathsToBeRemoved.forEach(modulePath => exports.moduleHandler.remove(modulePath));
    },
    /**
     * Gets a module from cache or loads it from scratch
     *
     * @remarks
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
    get: (modulePath) => {
        const resolvedModulePath = require.resolve(modulePath);
        return (modules[resolvedModulePath] || exports.moduleHandler.load(resolvedModulePath));
    },
};
