import { Request, Response } from "express";

import { dataDirManager } from '@lib/store/dataDir';
import { queryRunner } from '@lib/query';
import { config } from '@lib/config';
import { cache } from '@lib/utils/cache';

export const status = (req: Request, res: Response) => {
  const response = {
    config,
    dataDirLastUpdate: dataDirManager.getDataDirLastUpdate(),
    query: {
      numberOfExecutions: queryRunner.getCount(),
      numberOfCachedQueries: cache.count('query'),
    },
  };
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(response);
};

module.exports = { status };
