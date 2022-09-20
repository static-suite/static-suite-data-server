"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watch = exports.getModificationDate = exports.findFilesInDir = exports.getFileContent = exports.readFile = exports.isJsonFile = void 0;
const fs_1 = __importDefault(require("fs"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const chokidar_1 = __importDefault(require("chokidar"));
const logger_1 = require("@lib/utils/logger");
const string_1 = require("@lib/utils/string");
const cache_1 = require("../cache");
/**
 * Tells whether a path is JSON or not.
 *
 * @remarks
 * A fast checker that avoids reading the contents of a file, or doing
 * some other complex operation to determine if a file contains JSON data.
 *
 * @internal
 */
const isJsonFile = (filepath) => filepath.slice(-5) === '.json';
exports.isJsonFile = isJsonFile;
/**
 * Reads a file and logs an error on failure.
 *
 * @param filePath - A path to a file.
 *
 * @returns The file contents as a string if file is found, or null otherwise.
 */
const readFile = (filePath) => {
    let content = null;
    try {
        content = fs_1.default.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
    }
    catch (error) {
        // When an error is thrown, content is undefined, so ensure
        // it is converted to null.
        content = null;
        logger_1.logger.error(`Error reading file "${filePath}": ${error}`);
    }
    return content;
};
exports.readFile = readFile;
/**
 * Gets raw and JSON parsed content from a file.
 *
 * @param filepath - A path to a file.
 *
 * @returns Object with two properties, "raw" and "json", which contain
 * the raw and json version of the file. If file is not a JSON, the "json"
 * property is null. If file is not found, both properties are null.
 */
const getFileContent = (filepath, options = {
    readFileFromCache: false,
    isFileCacheEnabled: false,
}) => {
    let raw;
    if (options.isFileCacheEnabled && options.readFileFromCache) {
        raw = cache_1.cache.bin('file').get(filepath);
    }
    if (!raw) {
        raw = (0, exports.readFile)(filepath);
        if (options.isFileCacheEnabled) {
            cache_1.cache.bin('file').set(filepath, raw);
        }
    }
    let json = null;
    if (raw && (0, exports.isJsonFile)(filepath)) {
        json = (0, string_1.parseJsonString)(raw);
        if (!json) {
            logger_1.logger.error(`Error getting JSON from file "${filepath}"`);
        }
    }
    return { raw, json };
};
exports.getFileContent = getFileContent;
/**
 * Finds all files inside a directory
 *
 * @param dir - Absolute path to the directory to be scanned
 * @param glob - Optional glob to filter results (default all files recursive '**\/*')
 * @param options - Options for the fast-glob package.
 * See https://www.npmjs.com/package/fast-glob for reference .
 *
 * @returns Array of file paths found inside directory
 */
const findFilesInDir = (dir, glob = '**/*', options = { absolute: false }) => {
    const startDate = Date.now();
    const files = fast_glob_1.default.sync([glob], { cwd: dir, ...options });
    const endDate = Date.now();
    logger_1.logger.debug(`${files.length} files found inside ${dir} in ${endDate - startDate}ms.`);
    return files;
};
exports.findFilesInDir = findFilesInDir;
/**
 * Gets a file's modification date and logs an error on failure.
 *
 * @param filePath - Path to the file
 *
 * @returns The file's modification date as a Date object, or null on error
 */
const getModificationDate = (filePath) => {
    let modificationDate = null;
    try {
        modificationDate = new Date(fs_1.default.statSync(filePath).mtime);
    }
    catch (e) {
        logger_1.logger.error(`Error getting modification date for ${`path`}: ${e}`);
    }
    return modificationDate;
};
exports.getModificationDate = getModificationDate;
/**
 * Watches for changes on a set of paths and attach listener to them
 *
 * @remarks
 * It handles three different events: add, change and unlink
 *
 * @param paths - An array of paths to be watched
 * @param listeners - An object with three optional event keys (add, change and unlink)
 * and a listener function as value. That function will be executed once any of
 * the event keys is dispatched.
 */
const watch = (paths, listeners) => {
    if (paths.length > 0) {
        const watcher = chokidar_1.default.watch(paths, {
            ignored: /(^|[/\\])\../,
            persistent: true,
        });
        // Add event listeners.
        watcher.on('ready', () => {
            logger_1.logger.debug(`Watcher listening for changes on ${paths.join(',')}`);
            watcher
                .on('add', filePath => {
                logger_1.logger.debug(`File ${filePath} added`);
                listeners.add(filePath);
            })
                .on('change', filePath => {
                logger_1.logger.debug(`File ${filePath} changed`);
                listeners.change(filePath);
            })
                .on('unlink', filePath => {
                logger_1.logger.debug(`File ${filePath} removed`);
                listeners.unlink(filePath);
            });
        });
    }
};
exports.watch = watch;
