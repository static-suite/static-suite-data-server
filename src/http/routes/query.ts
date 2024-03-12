import { Request, Response } from 'express';
import { dataDirManager } from '../../lib/store/dataDir';
import { queryRunner, queryManager } from '../../lib/query';
import {
  QueryErrorResponse,
  QuerySuccessfulResponse,
} from '../../lib/query/query.types';

const queryIndex = (req: Request, res: Response): void => {
  const queryIds = Array.from(queryManager.getModuleGroupInfo().keys());
  res.render('queryIndex', {
    queryIds:
      queryIds.length > 0 ? queryIds.map(query => `/query/${query}`) : null,
  });
};

const runQuery = (req: Request, res: Response): void => {
  dataDirManager.update();
  const queryDefinition = req.originalUrl.replace(/^\/query\//, '');
  const response: QuerySuccessfulResponse | QueryErrorResponse =
    queryRunner.run(queryDefinition);
  res.status(200);
  res.set('application/json');
  res.send(response);
};

export { queryIndex, runQuery };
