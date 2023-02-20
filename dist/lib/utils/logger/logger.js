"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureLogger = exports.logger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const winston_1 = __importDefault(require("winston"));
const logger_types_1 = require("./logger.types");
/**
 * Defines a custom log format that prints a timestamp, a level and a message
 */
const customFormat = winston_1.default.format.printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`);
/**
 * The combined log format, that makes use of the custom log format
 */
const combinedFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), customFormat);
/**
 * The winston logger
 */
exports.logger = winston_1.default.createLogger({
    levels: winston_1.default.config.npm.levels,
    level: 'info',
    format: winston_1.default.format.json(),
    transports: [
        // Write all logs with level `info` and below to console
        new winston_1.default.transports.Console({
            format: combinedFormat,
        }),
    ],
});
/**
 * Configures a logger instance
 *
 * @remarks
 * The logger can log its messages to two different transports:
 *
 * 1) The stdout (from the terminal/console which started this process)
 * 2) A log file located on the filesystem
 *
 * Since stdout is a volatile transport that cannot be reviewed at a
 * later point in time, it is recommended to use the log file when
 * running the Data Server on production environments.
 *
 * If a log file is defined, but its path is no writable, it should:
 * 1) Log an error (which would be logged to the stdout)
 * 2) Throw an error
 *
 * @param level - Log level, defaults to "warn"
 * @param logFile - Configuration data for the log file. An object
 * containing two properties: path and level
 *
 * @throws
 * An exception if a log file is defined, but its path is no writable
 */
const configureLogger = (
// eslint-disable-next-line default-param-last
level = logger_types_1.LogLevel.WARN, logFile) => {
    if (level) {
        exports.logger.level = level;
    }
    if (logFile && logFile.path) {
        const logFileAbsolute = fs_1.default.realpathSync(path_1.default.resolve(logFile.path));
        // Check if file dirname is writable.
        try {
            fs_1.default.accessSync(path_1.default.dirname(logFileAbsolute), fs_1.default.constants.W_OK);
        }
        catch (e) {
            // Log error and rethrow.
            exports.logger.error(`Log file "${logFileAbsolute}" is not writable: ${e}`);
            throw e;
        }
        // Create and add the file transport to the logger
        const fileTransport = new winston_1.default.transports.File({
            filename: path_1.default.basename(logFileAbsolute),
            dirname: path_1.default.dirname(logFileAbsolute),
            format: combinedFormat,
            level: logFile.level,
        });
        exports.logger.add(fileTransport);
    }
};
exports.configureLogger = configureLogger;
