import { Logger } from '@lib/utils/logger/logger.types';
import { DataDirManager } from '@lib/store/dataDir/dataDir.types';
import { QueryRunner } from '@lib/query/query.types';

export enum RunMode {
  DEV = 'dev',
  PROD = 'prod',
}

export type RunModeStrings = keyof typeof RunMode;

export type DataServerReturn = {
  data: any;
  dataDirManager: DataDirManager;
  queryRunner: QueryRunner;
  logger: Logger;
};
