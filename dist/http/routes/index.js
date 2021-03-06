"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const home_1 = require("./home");
const query_1 = require("./query");
const cache_1 = require("./cache");
const reset_1 = require("./reset");
const status_1 = require("./status");
const data_1 = require("./data");
const docs_1 = require("./docs");
const routes = (0, express_1.Router)();
routes.get('/', home_1.home);
routes.get('/docs', docs_1.docs);
routes.get('/status', status_1.status);
routes.get('/reset', reset_1.reset);
routes.get('/query', query_1.queryIndex);
routes.get('/query/*', query_1.runQuery);
routes.get('/cache', cache_1.cacheIndex);
routes.get('/cache/*/clear', cache_1.cacheClear);
// routes.get('/cache/*', runQuery);
routes.get(['/data/*', '/data'], data_1.data);
exports.default = routes;
