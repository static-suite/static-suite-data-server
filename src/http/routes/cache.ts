import { Request, Response } from 'express';
/* import { dataDirManager } from '@lib/store/dataDir';
import { queryRunner } from '@lib/query';
import {
  QueryErrorResponse,
  QuerySuccessfulResponse,
} from '@lib/query/query.types'; */
import { cache } from '@lib/utils/cache';

export const cacheIndex = (req: Request, res: Response): void => {
  const cacheBins = Array.from(cache.keys());
  res.render('cacheIndex', { cacheBins });
};

export const cacheClear = (req: Request, res: Response): void => {
  const cacheBinId = req.params[0];
  let done = false;
  if (cache.has(cacheBinId)) {
    cache.bin(cacheBinId).clear();
    done = true;
  }
  res.render('cacheClear', { cacheBinId, done });
};
