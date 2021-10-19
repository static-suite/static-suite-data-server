import { Logger } from '@lib/utils/logger';
import { DataDirManager } from '@lib/store/dataDir/dataDir.types';
import { QueryRunner } from '@lib/query/query.types';

export enum RunMode {
  DEV = 'dev',
  PROD = 'prod',
}

export type DataServerReturn = {
  data: any;
  dataDirManager: DataDirManager;
  queryRunner: QueryRunner;
  logger: Logger;
};
