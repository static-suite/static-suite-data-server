import { config } from '@lib/config';

const getLogFile = (): string => `${config.workDir}/lock-executed.log`;

export { getLogFile };
