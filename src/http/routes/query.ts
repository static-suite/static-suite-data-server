import { Request, Response } from 'express';
import { dataDirManager } from '@lib/store/dataDir';
import { queryRunner } from '@lib/query';
import { queryManager } from '@lib/query';
import {
  QueryErrorResponse,
  QuerySuccessfulResponse,
} from '@lib/query/query.types';

const queryIndex = (req: Request, res: Response) => {
  const queryIds = Array.from(queryManager.getModuleGroupInfo().keys());
  res.render('queryIndex', {
    queryIds:
      queryIds.length > 0 ? queryIds.map(query => `/query/${query}`) : null,
  });
};

const runQuery = (req: Request, res: Response) => {
  dataDirManager.update();
  const args: any = req.query;
  const queryId = req.params[0];
  const response: QuerySuccessfulResponse | QueryErrorResponse =
    queryRunner.run(queryId, args);
  res.status(200);
  res.set('application/json');
  return res.send(response);
};

export { queryIndex, runQuery };
