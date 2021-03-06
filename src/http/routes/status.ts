import { Request, Response } from 'express';
import { dataDirManager } from '@lib/store/dataDir';
import { queryRunner } from '@lib/query';
import { config } from '@lib/config';
import { cache } from '@lib/utils/cache';

export const status = (req: Request, res: Response): void => {
  const response = {
    config,
    dataDirLastUpdate: dataDirManager.getModificationDate(),
    query: {
      numberOfExecutions: queryRunner.getCount(),
      numberOfCachedQueries: cache.bin('query').size,
    },
  };
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(response);
};

module.exports = { status };
