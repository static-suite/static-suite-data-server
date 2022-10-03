import { Router } from 'express';
import { home } from './home';
import { queryIndex, runQuery } from './query';
import { cacheIndex, cacheClear } from './cache';
import {
  statusBasic,
  statusDiff,
  statusIndex,
  statusIndexCustom,
  statusIndexUrl,
  statusIndexUuid,
} from './status';
import { data } from './data';
import { docs } from './docs';
import { runTask, taskIndex } from './task';
import {
  dumpIndex,
  dumpIncremental,
  dumpFull,
  dumpMetadataShow,
  dumpMetadataReset,
} from './dump';
import {
  dependencyIndex,
  dependencyInvalidatedFilepaths,
  dependencyExplicitlyInvalidatedTags,
  dependencyAllInvalidatedTags,
  dependencyTreeReversed,
  dependencyTreeRoute,
  dependencyTagParents,
} from './dependency';

const routes = Router();

routes.get('/', home);
routes.get('/docs', docs);
routes.get('/status/basic', statusBasic);
routes.get('/status/index/url', statusIndexUrl);
routes.get('/status/index/uuid', statusIndexUuid);
routes.get('/status/index/custom', statusIndexCustom);
routes.get('/status/diff', statusDiff);
routes.get('/status', statusIndex);
routes.get('/query', queryIndex);
routes.get('/query/*', runQuery);
routes.get('/task', taskIndex);
routes.get('/task/*', runTask);
routes.get('/cache', cacheIndex);
routes.get('/cache/*/clear', cacheClear);
routes.get('/dump', dumpIndex);
routes.get('/dump/incremental', dumpIncremental);
routes.get('/dump/full', dumpFull);
routes.get('/dump/metadata/show', dumpMetadataShow);
routes.get('/dump/metadata/reset', dumpMetadataReset);
routes.get('/dependency/tree/reversed', dependencyTreeReversed);
routes.get('/dependency/tree', dependencyTreeRoute);
routes.get('/dependency/invalidated/tags', dependencyExplicitlyInvalidatedTags);
routes.get('/dependency/invalidated/tags/all', dependencyAllInvalidatedTags);
routes.get('/dependency/invalidated/filepaths', dependencyInvalidatedFilepaths);
routes.get('/dependency/tag/parents', dependencyTagParents);
routes.get('/dependency', dependencyIndex);
routes.get(['/data/*', '/data'], data);

export default routes;
