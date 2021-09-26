"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadataHelper = void 0;
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../config");
const fsUtils_1 = require("../utils/fsUtils");
const logger_1 = require("../utils/logger");
const changedFileCache = {};
const getLogFile = () => `${config_1.config.workDir}/lock-executed.log`;
/**
   * Get changed files since a date.
   *
   * @param {Date} sinceDate - Date to search

  * @return {string[]} Array of changed lines
   */
const getChangedLinesSince = (sinceDate) => {
    let allLines = [];
    const logFile = getLogFile();
    try {
        allLines = fs_1.default.readFileSync(logFile).toString().split('\n');
    }
    catch (e) {
        logger_1.logger.error(`Error reading metadata log file located at ${`logFile`}: ${e}`);
    }
    // todo - Do not use dates and use timestamps in all cases
    //  to avoid having to fix offsets.
    const date = new Date();
    const dateOffset = -(date.getTimezoneOffset() * 60 * 1000);
    const changedLines = allLines.filter(line => {
        const uniqueId = line.substr(0, 32);
        if (!uniqueId) {
            return false;
        }
        const dateString = uniqueId.replace(/(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})\.(\d{3}).*/, '$1-$2-$3T$4:$5:$6.$7');
        const uniqueIdDate = Date.parse(dateString) + dateOffset;
        return uniqueIdDate && uniqueIdDate > sinceDate.getTime();
    });
    logger_1.logger.debug(`Found ${changedLines.length} changed lines`);
    changedLines.forEach(line => {
        logger_1.logger.debug(`Found changed line: ${line}`);
    });
    return changedLines;
};
/**
 * Extract information from metadata log line.
 *
 * @param {string} line - Log line.
 *
 * @return {(Object)} - An object with parsed data.
 */
const getDataFromLogLine = (line) => {
    const matches = line.match(/^(\S+) (\S+) \[ID: ([^\]]+)] (.+)/);
    if (matches) {
        const uniqueId = matches[1];
        const operation = matches[2];
        const fileId = matches[3];
        const [fileLabel, uri] = matches[4].split(' | ');
        const [, uriTarget] = uri.split('://');
        return {
            uniqueId,
            operation,
            file: {
                id: fileId,
                label: fileLabel,
                path: uriTarget,
            },
        };
    }
    return null;
};
/**
 * @typedef {Object} MetadataHelper
 * @property {Function} getLastUpdate
 * @property {Function} getChangedFilesSince
 */
exports.metadataHelper = {
    /**
     * Get date of last update of metadata dir (work dir).
     *
     * @return {Date} - The date of last update of metadata dir (work dir).
     */
    getLastUpdate: () => (0, fsUtils_1.getModificationDate)(getLogFile()),
    /**
     * @typedef ChangedFiles
     * @type {object}
     * @property {string[]} updated - Array of updated files.
     * @property {string[]} deleted - Array of deleted files.
     */
    /**
     * Get changed files since a date.
     *
     * @param {Date} sinceDate - Date to search
     *
     * @return {ChangedFiles} Array of changed files.
     *
     */
    getChangedFilesSince: (sinceDate) => {
        const sinceDateTimestamp = sinceDate.getTime();
        if (!changedFileCache[sinceDateTimestamp]) {
            const changedLines = getChangedLinesSince(sinceDate);
            const linesData = [];
            changedLines.forEach(line => {
                const dataFromLogLine = getDataFromLogLine(line);
                if (dataFromLogLine) {
                    linesData.push(dataFromLogLine);
                }
            });
            const updated = linesData
                .filter(data => data.operation === 'write')
                .map(data => data.file.path);
            updated.forEach(file => {
                logger_1.logger.debug(`Found updated file "${file}"`);
            });
            const deleted = linesData
                .filter(data => data.operation === 'delete')
                .map(data => data.file.path);
            deleted.forEach(file => {
                logger_1.logger.debug(`Found deleted file "${file}"`);
            });
            changedFileCache[sinceDateTimestamp] = { updated, deleted };
        }
        return changedFileCache[sinceDateTimestamp];
    },
};
