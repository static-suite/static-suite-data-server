import fs from 'fs';
import { logger } from '@lib/utils/logger';
import { getLogFile } from './getLogFile';

/**
   * Get changed files since a date.
   *
   * @param sinceDate - Date to search

  * @returns Array of changed lines
   */
export const getChangedLinesSince = (sinceDate: Date): string[] => {
  let allLines: string[] = [];
  const logFile = getLogFile();
  if (logFile) {
    try {
      allLines = fs.readFileSync(logFile).toString().split('\n');
    } catch (e) {
      logger.error(
        `Error reading metadata log file located at ${`logFile`}: ${e}`,
      );
    }
  }

  // todo - Do not use dates and use timestamps in all cases
  //  to avoid having to fix offsets.
  const date = new Date();
  const dateOffset = -(date.getTimezoneOffset() * 60 * 1000);

  const changedLines = allLines.filter(line => {
    const uniqueId = line.substring(0, 32);
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
