"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workDirHelper = void 0;
const fs_1 = require("@lib/utils/fs");
const logger_1 = require("@lib/utils/logger");
const storage_1 = require("./storage");
exports.workDirHelper = {
    /**
     * Gets date of last modification of work directory.
     *
     * @returns The date of last modification of work directory, or null if directory not found.
     */
    getModificationDate: () => {
        const logFile = (0, storage_1.getLogFile)();
        return logFile ? (0, fs_1.getModificationDate)(logFile) : null;
    },
    /**
     * Get changed files since a date.
     *
     * @param sinceDate - Date to search
     *
     * @returns Object with two properties:
     * - updated: array of changed files.
     * - deleted: array of deleted files.
     */
    getChangedFilesSince: (sinceDate) => {
        const changedLines = (0, storage_1.getChangedLinesSince)(sinceDate);
        const lineData = {};
        changedLines.forEach(line => {
            const dataFromLogLine = (0, storage_1.getDataFromLogLine)(line);
            if (dataFromLogLine) {
                // Save lines keyed by its relativePath so only the last
                // operation on the same file is processed.
                lineData[dataFromLogLine.file.relativePath] = dataFromLogLine;
            }
        });
        const lineDataArray = Object.values(lineData);
        const updated = lineDataArray
            .filter(data => data.operation === 'write')
            .map(data => data.file.relativePath);
        updated.forEach(file => {
            logger_1.logger.debug(`Found updated file "${file}"`);
        });
        const deleted = lineDataArray
            .filter(data => data.operation === 'delete')
            .map(data => data.file.relativePath);
        deleted.forEach(file => {
            logger_1.logger.debug(`Found deleted file "${file}"`);
        });
        return { updated, deleted };
    },
};
