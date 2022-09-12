"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const home_1 = require("./home");
const query_1 = require("./query");
const cache_1 = require("./cache");
const status_1 = require("./status");
const data_1 = require("./data");
const docs_1 = require("./docs");
const task_1 = require("./task");
const dump_1 = require("./dump");
const routes = (0, express_1.Router)();
routes.get('/', home_1.home);
routes.get('/docs', docs_1.docs);
routes.get('/status/basic', status_1.statusBasic);
routes.get('/status/index/url', status_1.statusIndexUrl);
routes.get('/status/index/uuid', status_1.statusIndexUuid);
routes.get('/status/index/include', status_1.statusIndexInclude);
routes.get('/status/index/custom', status_1.statusIndexCustom);
routes.get('/status/diff/tracker', status_1.statusDiffTracker);
routes.get('/status/diff', status_1.statusDiff);
routes.get('/status', status_1.statusIndex);
routes.get('/query', query_1.queryIndex);
routes.get('/query/*', query_1.runQuery);
routes.get('/task', task_1.taskIndex);
routes.get('/task/*', task_1.runTask);
routes.get('/cache', cache_1.cacheIndex);
routes.get('/cache/*/clear', cache_1.cacheClear);
routes.get('/dump', dump_1.dumpIndex);
routes.get('/dump/incremental', dump_1.dumpIncremental);
routes.get('/dump/full', dump_1.dumpFull);
routes.get('/dump/metadata', dump_1.dumpMetadata);
routes.get(['/data/*', '/data'], data_1.data);
exports.default = routes;
