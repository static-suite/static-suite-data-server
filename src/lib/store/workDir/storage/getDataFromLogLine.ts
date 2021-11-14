import { LogLineData } from '../workDir.types';

/**
 * Extract information from Static Suite's log line.
 *
 * @param line - Log line.
 *
 * @returns An object with parsed data, or null if line format is not valid.
 */
export const getDataFromLogLine = (line: string): LogLineData | null => {
  const matches = line.match(/^(\S+) (\S+) \[ID: ([^\]]+)] (.+)/);
  if (matches) {
    const uniqueId = matches[1];
    const operation = matches[2];
    const fileId = matches[3];
    const [fileLabel, uri] = matches[4].split(' | ');
    const [, uriTarget] = uri.split('://');
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
