import { Router } from 'express';
import { home } from './home';
import { queryIndex, runQuery } from './query';
import { cacheIndex, cacheClear } from './cache';
import {
  statusBasic,
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
import { indexUrl } from './indexUrl';
import { indexUUID } from './indexUUID';
import { subset } from './subset';
import { diffFull, diffIncremental, diffIndex, diffReset } from './diff';

const routes = Router();

routes.get('/', home);
routes.get('/docs', docs);
routes.get('/status/basic', statusBasic);
routes.get('/status/index/url', statusIndexUrl);
routes.get('/status/index/uuid', statusIndexUuid);
routes.get('/status/index/custom', statusIndexCustom);
routes.get('/status', statusIndex);
routes.get('/query', queryIndex);
routes.get('/query/*queryDefinition', runQuery);
routes.get('/task', taskIndex);
routes.get('/task/:taskId', runTask);
routes.get('/cache', cacheIndex);
routes.get('/cache/:cacheBinId/clear', cacheClear);
routes.get('/diff', diffIndex);
routes.get('/diff/incremental', diffIncremental);
routes.get('/diff/full', diffFull);
routes.get('/diff/reset', diffReset);
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
routes.get(['/data/*storeKeyParts', '/data'], data);
routes.get(['/index/url/*storeKeyParts', '/index/url'], indexUrl);
routes.get(['/index/uuid/:langcode/:uuid', '/index/uuid'], indexUUID);
routes.get('/subset', subset);

export default routes;
