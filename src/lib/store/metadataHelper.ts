import fs from 'fs';
import { config } from '../config';
import { getModificationDate } from '../utils/fsUtils';
import { logger } from '../utils/logger';

type ChangedFiles = {
  updated: string[];
  deleted: string[];
};

type LogLineData = {
  uniqueId: string;
  operation: string;
  file: {
    id: string;
    label: string;
    path: string;
  };
};

const changedFileCache: Record<number, ChangedFiles> = {};

const getLogFile = (): string => `${config.workDir}/lock-executed.log`;

/**
   * Get changed files since a date.
   *
   * @param {Date} sinceDate - Date to search

  * @return {string[]} Array of changed lines
   */
const getChangedLinesSince = (sinceDate: Date): string[] => {
  let allLines: string[] = [];
  const logFile = getLogFile();
  try {
    allLines = fs.readFileSync(logFile).toString().split('\n');
  } catch (e) {
    logger.error(
      `Error reading metadata log file located at ${`logFile`}: ${e}`,
    );
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
    const dateString = uniqueId.replace(
      /(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})\.(\d{3}).*/,
      '$1-$2-$3T$4:$5:$6.$7',
    );
    const uniqueIdDate = Date.parse(dateString) + dateOffset;
    return uniqueIdDate && uniqueIdDate > sinceDate.getTime();
  });
  logger.debug(`Found ${changedLines.length} changed lines`);
  changedLines.forEach(line => {
    logger.debug(`Found changed line: ${line}`);
  });
  return changedLines;
};

/**
 * Extract information from metadata log line.
 *
 * @param {string} line - Log line.
 *
 * @return {(Object)} - An object with parsed data.
 */
const getDataFromLogLine = (line: string): LogLineData | null => {
  const matches = line.match(/^(\S+) (\S+) \[ID: ([^\]]+)] (.+)/);
  if (matches) {
    const uniqueId = matches[1];
    const operation = matches[2];
    const fileId = matches[3];
    const [fileLabel, uri] = matches[4].split(' | ');
    const [, uriTarget] = uri.split('://');
    return {
      uniqueId,
      operation,
      file: {
        id: fileId,
        label: fileLabel,
        path: uriTarget,
      },
    };
  }
  return null;
};

/**
 * @typedef {Object} MetadataHelper
 * @property {Function} getLastUpdate
 * @property {Function} getChangedFilesSince
 */
export const metadataHelper = {
  /**
   * Get date of last update of metadata dir (work dir).
   *
   * @return {Date} - The date of last update of metadata dir (work dir).
   */
  getLastUpdate: (): Date | null => getModificationDate(getLogFile()),

  /**
   * @typedef ChangedFiles
   * @type {object}
   * @property {string[]} updated - Array of updated files.
   * @property {string[]} deleted - Array of deleted files.
   */

  /**
   * Get changed files since a date.
   *
   * @param {Date} sinceDate - Date to search
   *
   * @return {ChangedFiles} Array of changed files.
   *
   */
  getChangedFilesSince: (sinceDate: Date): ChangedFiles => {
    const sinceDateTimestamp = sinceDate.getTime();
    if (!changedFileCache[sinceDateTimestamp]) {
      const changedLines = getChangedLinesSince(sinceDate);
      const linesData: LogLineData[] = [];
      changedLines.forEach(line => {
        const dataFromLogLine = getDataFromLogLine(line);
        if (dataFromLogLine) {
          linesData.push(dataFromLogLine);
        }
      });

      const updated = linesData
        .filter(data => data.operation === 'write')
        .map(data => data.file.path);
      updated.forEach(file => {
        logger.debug(`Found updated file "${file}"`);
      });

      const deleted = linesData
        .filter(data => data.operation === 'delete')
        .map(data => data.file.path);
      deleted.forEach(file => {
        logger.debug(`Found deleted file "${file}"`);
      });

      changedFileCache[sinceDateTimestamp] = { updated, deleted };
    }

    return changedFileCache[sinceDateTimestamp];
  },
};
