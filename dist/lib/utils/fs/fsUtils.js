"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModificationDate = exports.findFilesInDir = exports.getFileContent = exports.parseJsonString = exports.readFile = void 0;
const fs_1 = __importDefault(require("fs"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const logger_1 = require("@lib/utils/logger");
/**
 * A set of various functions related to the file system
 */
/**
 * Tells whether a path is JSON or not.
 *
 * @remarks
 * A fast checker that avoids reading the contents of a file, or doing
 * some other complex operation to determine if a file contains JSON data.
 */
const isJson = (filepath) => filepath.substr(-5) === '.json';
/**
 * Reads a file and logs an error on failure.
 *
 * @param absoluteFilePath - Absolute path to the file.
 *
 * @returns The file contents as a string if file is found, or null otherwise.
 */
const readFile = (absoluteFilePath) => {
    let contents = null;
    try {
        contents = fs_1.default.readFileSync(absoluteFilePath, 'utf8');
    }
    catch (error) {
        logger_1.logger.error(`Error reading file "${absoluteFilePath}": ${error}`);
    }
    return contents;
};
exports.readFile = readFile;
/**
 * Parses a JSON string and logs an error on failure.
 *
 * @param jsonString - The string to be parsed.
 *
 * @returns A JSON object or null on error.
 */
const parseJsonString = (jsonString) => {
    let json = null;
    try {
        json = JSON.parse(jsonString);
    }
    catch (error) {
        logger_1.logger.error(`Error parsing JSON data "${jsonString}": ${error}`);
    }
    return json;
};
exports.parseJsonString = parseJsonString;
/**
 * Gets raw and JSON parsed content from a file.
 *
 * @param absoluteFilePath - Relative path to the file.
 *
 * @returns Object with two properties, "raw" and "json", which contain
 * the raw and json version of the file. If file is not a JSON, the "json"
 * property is null.
 */
const getFileContent = (absoluteFilePath) => {
    const raw = (0, exports.readFile)(absoluteFilePath);
    let json = null;
    if (isJson(absoluteFilePath) && raw) {
        json = (0, exports.parseJsonString)(raw);
        if (!json) {
            logger_1.logger.error(`Error getting JSON from file "${absoluteFilePath}"`);
        }
    }
    return { raw, json };
};
exports.getFileContent = getFileContent;
/**
 * Finds all files inside a directory
 *
 * @param dir - Absolute path to the directory to be scanned
 * @param glob - Optional glob to filter results
 *
 * @returns Array of file paths found inside directory
 */
const findFilesInDir = (dir, glob = '**/*') => {
    const startDate = Date.now();
    const files = fast_glob_1.default.sync([glob], { cwd: dir, dot: false });
    const endDate = Date.now();
    logger_1.logger.debug(`${files.length} files found inside ${dir} in ${endDate - startDate}ms.`);
    return files;
};
exports.findFilesInDir = findFilesInDir;
/**
 * Gets a file's modification date
 *
 * @param filePath - Absolute path to the directory to be scanned
 *
 * @returns The file's modification date as a Date object, or null on error
 */
const getModificationDate = (filePath) => {
    let modificationDate = null;
    try {
        modificationDate = fs_1.default.statSync(filePath).mtime;
    }
    catch (e) {
        logger_1.logger.error(`Error getting modification date for ${`path`}: ${e}`);
    }
    return modificationDate;
};
exports.getModificationDate = getModificationDate;
