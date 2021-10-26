import { LogLineData } from '../workDir.types';

/**
 * Extract information from metadata log line.
 *
 * @param line - Log line.
 *
 * @returns An object with parsed data.
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

export { getDataFromLogLine };
