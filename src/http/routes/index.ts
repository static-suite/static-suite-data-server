import { Router } from 'express';
import { home } from './home';
import { queryIndex, runQuery } from './query';
import { cacheIndex, cacheClear } from './cache';
import { reset } from './reset';
import { status } from './status';
import { data } from './data';
import { docs } from './docs';
import { runTask, taskIndex } from './task';

const routes = Router();

routes.get('/', home);
routes.get('/docs', docs);
routes.get('/status', status);
routes.get('/reset', reset);
routes.get('/query', queryIndex);
routes.get('/query/*', runQuery);
routes.get('/task', taskIndex);
routes.get('/task/*', runTask);
routes.get('/cache', cacheIndex);
routes.get('/cache/*/clear', cacheClear);
// routes.get('/cache/*', runQuery);
routes.get(['/data/*', '/data'], data);

export default routes;
