import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { LogLevel, LogFile } from './logger.types';

/**
 * Defines a custom log format that prints a timestamp, a level and a message
 */
const customFormat = winston.format.printf(
  ({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`,
);

/**
 * The combined log format, that makes use of the custom log format
 */
const combinedFormat = winston.format.combine(
  winston.format.timestamp(),
  customFormat,
);

/**
 * The winston logger
 */
export const logger: winston.Logger = winston.createLogger({
  levels: winston.config.npm.levels,
  level: 'info',
  format: winston.format.json(),
  transports: [
    // Write all logs with level `info` and below to console
    new winston.transports.Console({
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
export const configureLogger = (
  level: LogLevel = LogLevel.WARN,
  logFile?: LogFile,
): void => {
  if (level) {
    logger.level = level;
  }
  if (logFile && logFile.path) {
    const logFileAbsolute = fs.realpathSync(path.resolve(logFile.path));
    // Check if file dirname is writable.
    try {
      fs.accessSync(path.dirname(logFileAbsolute), fs.constants.W_OK);
    } catch (e) {
      // Log error and rethrow.
      logger.error(`Log file "${logFileAbsolute}" is not writable: ${e}`);
      throw e;
    }

    // Create and add the file transport to the logger
    const fileTransport = new winston.transports.File({
      filename: path.basename(logFileAbsolute),
      dirname: path.dirname(logFileAbsolute),
      format: combinedFormat,
      level: logFile.level,
    });
    logger.add(fileTransport);
  }
};
