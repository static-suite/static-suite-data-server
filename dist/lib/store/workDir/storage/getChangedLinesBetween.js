"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChangedLinesBetween = void 0;
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../../../utils/logger");
const string_1 = require("../../../utils/string");
const getLogFile_1 = require("./getLogFile");
/**
 * Get changed files between a set of dates.
 *
 * @param fromUniqueId - Unique id to search from.
 * @param toUniqueId - Unique id to search to.
 *
 * @remarks
 * It searches for lines grater than fromUniqueId and lower
 * or equal to toUniqueId, to avoid getting repeated entries
 * when dates are advanced in blocks (from 1 to 2, from 2 to 3,
 * from 3 to 4, etc).
 *
 * @returns Array of changed lines
 */
const getChangedLinesBetween = (fromUniqueId, toUniqueId) => {
    let allLines = [];
    const logFile = (0, getLogFile_1.getLogFile)();
    if (logFile) {
        try {
            allLines = fs_1.default.readFileSync(logFile).toString().trim().split('\n');
        }
        catch (e) {
            logger_1.logger.error(`Error reading metadata log file located at ${`logFile`}: ${e}`);
        }
    }
    const changedLines = allLines.filter(line => {
        const uniqueId = line.substring(0, 32);
        return (uniqueId &&
            (0, string_1.isUniqueId)(uniqueId) &&
            uniqueId > fromUniqueId &&
            uniqueId <= toUniqueId);
    });
    logger_1.logger.debug(`Found ${changedLines.length} changed lines`);
    changedLines.forEach(line => {
        logger_1.logger.debug(`Found changed line: ${line}`);
    });
    return changedLines;
};
exports.getChangedLinesBetween = getChangedLinesBetween;
