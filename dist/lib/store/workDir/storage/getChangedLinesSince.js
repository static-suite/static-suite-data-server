"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChangedLinesSince = void 0;
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("@lib/utils/logger");
const getLogFile_1 = require("./getLogFile");
/**
   * Get changed files since a date.
   *
   * @param sinceDate - Date to search

  * @returns Array of changed lines
   */
const getChangedLinesSince = (sinceDate) => {
    let allLines = [];
    const logFile = (0, getLogFile_1.getLogFile)();
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
exports.getChangedLinesSince = getChangedLinesSince;
