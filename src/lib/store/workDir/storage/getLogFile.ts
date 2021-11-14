import { config } from '@lib/config';

/**
 * Gets the absolute path to Static Suite's log file.
 *
 * @returns The absolute path to Static Suite's log file.
 */
const getLogFile = (): string => `${config.workDir}/lock-executed.log`;

export { getLogFile };
