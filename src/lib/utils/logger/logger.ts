import fs from 'fs';
import path, { resolve } from 'path';
import winston from 'winston';
import { LogLevel, LogFile } from './logger.types';

const customFormat = winston.format.printf(
  ({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`,
);

const combinedFormat = winston.format.combine(
  winston.format.timestamp(),
  customFormat,
);

const logger: winston.Logger = winston.createLogger({
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
 * Sets the logger log file and its level
 *
 * @param logFilePath - Absolute path to the log file
 * @param level - Optional log level, defaults to "warn"
 */
const setLogFile = (
  logFilePath: string,
  level: LogLevel = LogLevel.WARN,
): void => {
  const fileTransport = new winston.transports.File({
    filename: path.basename(logFilePath),
    dirname: path.dirname(logFilePath),
    format: combinedFormat,
    level,
  });
  logger.add(fileTransport);
};

const configureLogger = (level: LogLevel, logFile?: LogFile): void => {
  if (level) {
    logger.level = level;
  }
  if (logFile && logFile.path) {
    const logFileAbsolute = resolve(logFile.path);
    // Check if file dirname is writable.
    try {
      fs.accessSync(path.dirname(logFileAbsolute), fs.constants.W_OK);
    } catch (e) {
      // Log error and rethrow.
      logger.error(`Log file "${logFileAbsolute}" is not writable: ${e}`);
      throw e;
    }
    setLogFile(logFileAbsolute, logFile.level);
  }
};

export { logger, configureLogger, LogLevel, LogFile };
