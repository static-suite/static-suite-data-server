import { RunMode } from '@lib/dataServer.types';

export type Config = {
  dataDir: string;
  workDir?: string;
  queryDir?: string;
  postProcessor?: string;
  runMode: RunMode;
};
