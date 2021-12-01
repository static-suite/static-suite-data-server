import { getModificationDate } from '@lib/utils/fs';
import { logger } from '@lib/utils/logger';
import { ChangedFiles, LogLineData } from './workDir.types';
import {
  getLogFile,
  getChangedLinesSince,
  getDataFromLogLine,
} from './storage';

const changedFileCache: Record<number, ChangedFiles> = {};

export const workDirHelper = {
  /**
   * Gets date of last modification of work directory.
   *
   * @returns The date of last modification of work directory, or null if directory not found.
   */
  getModificationDate: (): Date | null => {
    const logFile = getLogFile();
    return logFile ? getModificationDate(logFile) : null;
  },

  /**
   * Get changed files since a date.
   *
   * @param sinceDate - Date to search
   *
   * @returns Object with two properties:
   * - updated: array of changed files.
   * - deleted: array of deleted files.
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
        .map(data => data.file.relativePath);
      updated.forEach(file => {
        logger.debug(`Found updated file "${file}"`);
      });

      const deleted = linesData
        .filter(data => data.operation === 'delete')
        .map(data => data.file.relativePath);
      deleted.forEach(file => {
        logger.debug(`Found deleted file "${file}"`);
      });

      changedFileCache[sinceDateTimestamp] = { updated, deleted };
    }

    return changedFileCache[sinceDateTimestamp];
  },
};
