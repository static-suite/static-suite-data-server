"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadataHelper = void 0;
const fsUtils_1 = require("../../utils/fsUtils");
const logger_1 = require("../../utils/logger");
const getLogFile_1 = require("./getLogFile");
const getChangedLinesSince_1 = require("./getChangedLinesSince");
const getDataFromLogLine_1 = require("./getDataFromLogLine");
const changedFileCache = {};
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
    getLastUpdate: () => (0, fsUtils_1.getModificationDate)((0, getLogFile_1.getLogFile)()),
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
            const changedLines = (0, getChangedLinesSince_1.getChangedLinesSince)(sinceDate);
            const linesData = [];
            changedLines.forEach(line => {
                const dataFromLogLine = (0, getDataFromLogLine_1.getDataFromLogLine)(line);
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
