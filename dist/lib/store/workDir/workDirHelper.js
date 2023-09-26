"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workDirHelper = exports.unixEpochUniqueId = void 0;
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../../utils/logger");
const string_1 = require("../../utils/string");
const storage_1 = require("./storage");
/**
 * The unique id of the Unix Epoch (00:00:00 UTC on 1 January 1970)
 */
exports.unixEpochUniqueId = '1970-01-01_00-00-00.000000__0000';
exports.workDirHelper = {
    /**
     * Gets unique id of last modification of work directory.
     *
     * @returns The unique id of last modification of work directory, or null if directory not found.
     */
    getModificationUniqueId: () => {
        let modificationUniqueId = null;
        const logFile = (0, storage_1.getLogFile)();
        let allLines = [];
        if (logFile) {
            try {
                allLines = fs_1.default.readFileSync(logFile).toString().trim().split('\n');
            }
            catch (e) {
                logger_1.logger.error(`Error reading metadata log file located at ${`logFile`}: ${e}`);
            }
            const lastLine = allLines.slice(-1)[0];
            const lastLineUniqueId = lastLine.substring(0, 32);
            if ((0, string_1.isUniqueId)(lastLineUniqueId)) {
                modificationUniqueId = lastLineUniqueId;
            }
        }
        return modificationUniqueId;
    },
    /**
     * Get changed files since a date.
     *
     * @param fromUniqueId - Date to search from.
     * @param toUniqueId - Date to search to.
     *
     * @returns Object with four properties:
     * - updated: array of changed files.
     * - deleted: array of deleted files.
     * - fromTimestamp
     * - toTimestamp
     */
    getChangedFilesBetween: (fromUniqueId, toUniqueId) => {
        const changedLines = (0, storage_1.getChangedLinesBetween)(fromUniqueId, toUniqueId);
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
        const lineDataByUniqueId = {};
        lineDataArray.forEach(lineDataGroup => {
            if (!lineDataByUniqueId[lineDataGroup.uniqueId]) {
                lineDataByUniqueId[lineDataGroup.uniqueId] = [];
            }
            lineDataByUniqueId[lineDataGroup.uniqueId].push(lineDataGroup);
        });
        const sortedUniqueIds = Object.keys(lineDataByUniqueId).sort();
        const all = [];
        sortedUniqueIds.forEach(sortedUniqueId => {
            lineDataByUniqueId[sortedUniqueId].forEach(data => {
                all.push({
                    file: data.file.relativePath,
                    type: data.operation === 'write' ? 'updated' : 'deleted',
                });
            });
        });
        all.forEach(data => {
            logger_1.logger.debug(`Found ${data.type} file "${data.file}"`);
        });
        const updated = lineDataArray
            .filter(data => data.operation === 'write')
            .map(data => data.file.relativePath);
        const deleted = lineDataArray
            .filter(data => data.operation === 'delete')
            .map(data => data.file.relativePath);
        return {
            all,
            updated,
            deleted,
            fromUniqueId,
            toUniqueId,
        };
    },
};
