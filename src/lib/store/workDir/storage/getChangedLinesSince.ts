import fs from 'fs';
import { logger } from '@lib/utils/logger';
import { isUniqueId } from '@lib/utils/string';
import { getLogFile } from './getLogFile';

/**
 * Get changed files between a set of dates.
 *
 * @param fromUniqueId - Unique id to search from.
 * @param toUniqueId - Unique id to search to.
 *
 * @remarks
 * It searches for lines grater than fromUniqueId and lower
 * or equal to toUniqueId, to avoid getting repeated entries
 * when dates are advanced in blocks (from 1 to 2, from 2 to 3,
 * from 3 to 4, etc).
 *
 * @returns Array of changed lines
 */
export const getChangedLinesBetween = (
  fromUniqueId: string,
  toUniqueId: string,
): string[] => {
  let allLines: string[] = [];
  const logFile = getLogFile();
  if (logFile) {
    try {
      allLines = fs.readFileSync(logFile).toString().trim().split('\n');
    } catch (e) {
      logger.error(
        `Error reading metadata log file located at ${`logFile`}: ${e}`,
      );
    }
  }

  const changedLines = allLines.filter(line => {
    const uniqueId = line.substring(0, 32);
    return (
      uniqueId &&
      isUniqueId(uniqueId) &&
      uniqueId > fromUniqueId &&
      uniqueId <= toUniqueId
    );
  });

  logger.debug(`Found ${changedLines.length} changed lines`);
  changedLines.forEach(line => {
    logger.debug(`Found changed line: ${line}`);
  });

  return changedLines;
};
