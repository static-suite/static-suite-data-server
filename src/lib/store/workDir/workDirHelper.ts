import fs from 'fs';
import { logger } from '../../utils/logger';
import { isUniqueId } from '../../utils/string';
import { ChangedFiles, LogLineData } from './workDir.types';
import {
  getLogFile,
  getChangedLinesBetween,
  getDataFromLogLine,
} from './storage';

/**
 * The unique id of the Unix Epoch (00:00:00 UTC on 1 January 1970)
 */
export const unixEpochUniqueId = '1970-01-01_00-00-00.000000__0000';

export const workDirHelper = {
  /**
   * Gets unique id of last modification of work directory.
   *
   * @returns The unique id of last modification of work directory, or null if directory not found.
   */
  getModificationUniqueId: (): string | null => {
    let modificationUniqueId: string | null = null;
    const logFile = getLogFile();
    let allLines: string[] = [];
    if (logFile) {
      try {
        allLines = fs.readFileSync(logFile).toString().trim().split('\n');
      } catch (e) {
        logger.error(
          `Error reading metadata log file located at ${`logFile`}: ${e}`,
        );
      }
      const lastLine = allLines.slice(-1)[0];
      const lastLineUniqueId = lastLine.substring(0, 32);
      if (isUniqueId(lastLineUniqueId)) {
        modificationUniqueId = lastLineUniqueId;
      }
    }

    return modificationUniqueId;
  },

  /**
   * Get changed files since a date.
   *
   * @param fromUniqueId - Date to search from.
   * @param toUniqueId - Date to search to.
   *
   * @returns Object with four properties:
   * - updated: array of changed files.
   * - deleted: array of deleted files.
   * - fromTimestamp
   * - toTimestamp
   */
  getChangedFilesBetween: (
    fromUniqueId: string,
    toUniqueId: string,
  ): ChangedFiles => {
    const changedLines = getChangedLinesBetween(fromUniqueId, toUniqueId);
    const lineData: Record<string, LogLineData> = {};
    changedLines.forEach(line => {
      const dataFromLogLine = getDataFromLogLine(line);
      if (dataFromLogLine) {
        // Save lines keyed by its relativePath so only the last
        // operation on the same file is processed.
        lineData[dataFromLogLine.file.relativePath] = dataFromLogLine;
      }
    });
    const lineDataArray: LogLineData[] = Object.values(lineData);

    const updated = lineDataArray
      .filter(data => data.operation === 'write')
      .map(data => data.file.relativePath);
    updated.forEach(file => {
      logger.debug(`Found updated file "${file}"`);
    });

    const deleted = lineDataArray
      .filter(data => data.operation === 'delete')
      .map(data => data.file.relativePath);
    deleted.forEach(file => {
      logger.debug(`Found deleted file "${file}"`);
    });

    return {
      updated,
      deleted,
      fromUniqueId,
      toUniqueId,
    };
  },
};
