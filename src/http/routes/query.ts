import { Request, Response } from 'express';

import { dataDirManager } from '@lib/store/dataDir';
import { queryRunner } from '@lib/query';
import { queryManager } from '@lib/query';
import { QueryErrorResponse, QueryResponse } from '@lib/query/query.types';

const queryIndex = (req: Request, res: Response) => {
  const queryIds = queryManager.getAvailableQueryIds();
  res.render('queryIndex', {
    queryIds:
      queryIds.length > 0 ? queryIds.map(query => `/query/${query}`) : null,
  });
};

const runQuery = (req: Request, res: Response) => {
  dataDirManager.update();
  const args: any = req.query;
  const queryId = req.params[0];
  const response: QueryResponse | QueryErrorResponse = queryRunner.run(
    queryId,
    args,
  );
  res.status(200);
  res.set(response.metadata?.contentType || 'application/json');
  return res.send(response);
};

export { queryIndex, runQuery };
