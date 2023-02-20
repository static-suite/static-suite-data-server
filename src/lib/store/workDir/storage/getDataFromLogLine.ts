import { logger } from '../../../utils/logger';
import { LogLineData } from '../workDir.types';

/**
 * Extract information from Static Suite's log line.
 *
 * @param line - Log line.
 *
 * @returns An object with parsed data, or null if line format is not valid.
 */
export const getDataFromLogLine = (line: string): LogLineData | null => {
  const matches = line.match(/^(\S+) (\S+) \[ID: ([^\]]+)] (.+)$/);
  if (matches) {
    const uniqueId = matches[1];
    const operation = matches[2];
    const fileId = matches[3];
    // Some lines contain more than one "|"
    const labelUriParts = matches[4].split(' | ');
    const uri = labelUriParts.pop();
    const fileLabel = labelUriParts.join(' | ');
    const uriTarget = uri?.split('://').pop();

    if (
      !uniqueId ||
      (operation !== 'write' && operation !== 'delete') ||
      !fileId ||
      !fileLabel ||
      !uriTarget
    ) {
      const errorMessage = `Line ${line} meets parsing criteria but it contains invalid data. Regex match: ${JSON.stringify(
        matches,
      )}`;
      logger.error(errorMessage);
      throw Error(errorMessage);
    }

    if (operation === 'write' || operation === 'delete') {
      return {
        uniqueId,
        operation,
        file: {
          id: fileId,
          label: fileLabel,
          relativePath: uriTarget,
        },
      };
    }
  }
  return null;
};
