const fs = require('fs');
const path = require('path');
const { resolve } = require('path');
const winston = require('winston');

const customFormat = winston.format.printf(
  ({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`,
);

const combinedFormat = winston.format.combine(
  winston.format.timestamp(),
  customFormat,
);

const logger = winston.createLogger({
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

const setLoggerErrorLogFile = errorLogFile => {
  const fileTransport = new winston.transports.File({
    filename: path.basename(errorLogFile),
    dirname: path.dirname(errorLogFile),
    format: combinedFormat,
    level: 'error',
  });
  logger.add(fileTransport);
};

const incrementLoggerLevel = increment => {
  if (increment > 0) {
    const { levels } = winston.config.npm;
    const currentLevelCode = levels[logger.level];
    const newLevelCode = currentLevelCode + increment;
    const newLevelName = Object.keys(levels).find(
      level => levels[level] === newLevelCode,
    );
    const highestLevelName = Object.keys(levels).slice(-1).pop();
    logger.level = newLevelName || highestLevelName;
  }
};

const configureLogger = ({
  errorLogFile = null,
  logLevelIncrement = 0,
} = {}) => {
  if (errorLogFile) {
    const errorLogFileAbsolute = resolve(errorLogFile);
    // check if file dirname is writable
    try {
      fs.accessSync(path.dirname(errorLogFileAbsolute), fs.constants.W_OK);
    } catch (e) {
      // Log error and rethrow.
      logger.error(
        `Error log file "${errorLogFileAbsolute}" is not writable: ${e}`,
      );
      throw Error(e);
    }
    setLoggerErrorLogFile(errorLogFileAbsolute);
  }
  if (logLevelIncrement) {
    incrementLoggerLevel(logLevelIncrement);
  }
};

module.exports = { logger, configureLogger };
