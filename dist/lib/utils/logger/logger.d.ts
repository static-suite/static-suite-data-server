import winston from 'winston';
import { LogLevel, LogFile } from './logger.types';
/**
 * The winston logger
 */
export declare const logger: winston.Logger;
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
export declare const configureLogger: (level?: LogLevel, logFile?: LogFile) => void;
//# sourceMappingURL=logger.d.ts.map