import { getModificationDate } from '@lib/utils/fsUtils';
import { logger } from '@lib/utils/logger';
import { ChangedFiles, LogLineData } from './workDir.types';
import {
  getLogFile,
  getChangedLinesSince,
  getDataFromLogLine,
} from './storage';

const changedFileCache: Record<number, ChangedFiles> = {};

/**
 * @typedef {Object} MetadataHelper
 * @property {Function} getLastUpdate
 * @property {Function} getChangedFilesSince
 */
const workDirHelper = {
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

export { workDirHelper };
