"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariantName = exports.getModificationDate = exports.findFilesInDir = exports.getFileContent = exports.parseJsonString = exports.readFile = exports.isJson = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const logger_1 = require("@lib/utils/logger");
const VARIANT_SEPARATOR = '--';
const isJson = (file) => file.substr(-5) === '.json';
exports.isJson = isJson;
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
 * Get raw and JSON parsed content from a file.
 *
 * @param {string} absoluteFilePath - Relative path to the file.
 *
 * @return {FileType} Object with two properties, "raw" and "json", which contain
 *                   the raw and json version of the file.
 */
const getFileContent = (absoluteFilePath) => {
    const raw = (0, exports.readFile)(absoluteFilePath);
    let json = null;
    if ((0, exports.isJson)(absoluteFilePath) && raw) {
        json = (0, exports.parseJsonString)(raw);
        if (!json) {
            logger_1.logger.error(`Error getting JSON from file "${absoluteFilePath}"`);
        }
    }
    return { raw, json };
};
exports.getFileContent = getFileContent;
/**
 * Find all files inside a directory.
 *
 * @param {string} dir - Relative path to the directory to be scanned.
 *
 * @return {array} files - Array of file paths found inside dir.
 */
const findFilesInDir = (dir, glob = '**/*') => {
    const startDate = Date.now();
    const files = fast_glob_1.default.sync([glob], { cwd: dir, dot: false });
    const endDate = Date.now();
    logger_1.logger.debug(`${files.length} files found inside ${dir} in ${endDate - startDate}ms.`);
    return files;
};
exports.findFilesInDir = findFilesInDir;
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
const getVariantName = (filePath) => {
    const fileName = path_1.default.parse(filePath).name;
    if (fileName.indexOf(VARIANT_SEPARATOR) !== -1) {
        return fileName.split(VARIANT_SEPARATOR).pop();
    }
    return undefined;
};
exports.getVariantName = getVariantName;
