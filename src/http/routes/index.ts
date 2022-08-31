import { Router } from 'express';
import { home } from './home';
import { queryIndex, runQuery } from './query';
import { cacheIndex, cacheClear } from './cache';
import {
  statusBasic,
  statusIndex,
  statusIndexCustom,
  statusIndexInclude,
  statusIndexUrl,
  statusIndexUuid,
} from './status';
import { data } from './data';
import { docs } from './docs';
import { runTask, taskIndex } from './task';
import { diffIndex } from './dump';

const routes = Router();

routes.get('/', home);
routes.get('/docs', docs);
routes.get('/status/basic', statusBasic);
routes.get('/status/index/url', statusIndexUrl);
routes.get('/status/index/uuid', statusIndexUuid);
routes.get('/status/index/include', statusIndexInclude);
routes.get('/status/index/custom', statusIndexCustom);
routes.get('/status', statusIndex);
routes.get('/query', queryIndex);
routes.get('/query/*', runQuery);
routes.get('/task', taskIndex);
routes.get('/task/*', runTask);
routes.get('/cache', cacheIndex);
routes.get('/cache/*/clear', cacheClear);
routes.get('/dump', diffIndex);
routes.get(['/data/*', '/data'], data);

export default routes;
