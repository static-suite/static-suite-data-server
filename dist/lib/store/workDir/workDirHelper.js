"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workDirHelper = void 0;
const fs_1 = require("@lib/utils/fs");
const logger_1 = require("@lib/utils/logger");
const storage_1 = require("./storage");
const changedFileCache = {};
exports.workDirHelper = {
    /**
     * Gets date of last modification of work directory.
     *
     * @returns The date of last modification of work directory, or null if directory not found.
     */
    getModificationDate: () => (0, fs_1.getModificationDate)((0, storage_1.getLogFile)()),
    /**
     * Get changed files since a date.
     *
     * @param sinceDate - Date to search
     *
     * @returns Array of changed files.
     *
     */
    getChangedFilesSince: (sinceDate) => {
        const sinceDateTimestamp = sinceDate.getTime();
        if (!changedFileCache[sinceDateTimestamp]) {
            const changedLines = (0, storage_1.getChangedLinesSince)(sinceDate);
            const linesData = [];
            changedLines.forEach(line => {
                const dataFromLogLine = (0, storage_1.getDataFromLogLine)(line);
                if (dataFromLogLine) {
                    linesData.push(dataFromLogLine);
                }
            });
            const updated = linesData
                .filter(data => data.operation === 'write')
                .map(data => data.file.relativePath);
            updated.forEach(file => {
                logger_1.logger.debug(`Found updated file "${file}"`);
            });
            const deleted = linesData
                .filter(data => data.operation === 'delete')
                .map(data => data.file.relativePath);
            deleted.forEach(file => {
                logger_1.logger.debug(`Found deleted file "${file}"`);
            });
            changedFileCache[sinceDateTimestamp] = { updated, deleted };
        }
        return changedFileCache[sinceDateTimestamp];
    },
};
