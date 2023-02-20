import winston from 'winston';
/**
 * The logger service.
 *
 * @remarks
 * A logger currently based on the "winston" package.
 */
export type Logger = winston.Logger;
/**
 * Log levels: error, warn, info and debug.
 *
 * @public
 */
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}
/**
 * A helper to get LogLevel type as strings. @see {@link LogLevel}.
 */
export type LogLevelStrings = keyof typeof LogLevel;
/**
 * A log file definition.
 */
export type LogFile = {
    /**
     * Path to the log file.
     */
    path: string;
    /**
     * Log level for the log file.
     */
    level: LogLevel;
};
//# sourceMappingURL=logger.types.d.ts.map