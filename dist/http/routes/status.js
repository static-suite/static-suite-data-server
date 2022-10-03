"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusDiff = exports.statusIndexCustom = exports.statusIndexUuid = exports.statusIndexUrl = exports.statusBasic = exports.statusIndex = void 0;
const dataDir_1 = require("@lib/store/dataDir");
const query_1 = require("@lib/query");
const config_1 = require("@lib/config");
const cache_1 = require("@lib/utils/cache");
const store_1 = require("@lib/store");
const object_1 = require("@lib/utils/object");
const diffManager_1 = require("@lib/store/diff/diffManager");
const statusIndex = (req, res) => {
    res.render('statusIndex', {
        links: {
            '/status/basic': 'Basic status info',
            '/status/index/url': 'List of indexed URLs',
            '/status/index/uuid': 'List of indexed UUIDs by language',
            '/status/index/include': 'List of indexed includes',
            '/status/index/custom': 'List of custom indexes',
            '/status/diff': 'Executes a diff operation',
        },
    });
};
exports.statusIndex = statusIndex;
const statusBasic = (req, res) => {
    dataDir_1.dataDirManager.update();
    const response = {
        config: config_1.config,
        dataDirLastUpdate: dataDir_1.dataDirManager.getModificationUniqueId(),
        query: {
            numberOfExecutions: query_1.queryRunner.getCount(),
            numberOfCachedQueries: cache_1.cache.bin('query').size,
        },
    };
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send(response);
};
exports.statusBasic = statusBasic;
const statusIndexUrl = (req, res) => {
    const response = Array.from(store_1.store.index.url.keys());
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send(response);
};
exports.statusIndexUrl = statusIndexUrl;
const statusIndexUuid = (req, res) => {
    const response = {};
    store_1.store.index.uuid.forEach((uuids, langcode) => {
        response[langcode] = Array.from(uuids.keys());
    });
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send(response);
};
exports.statusIndexUuid = statusIndexUuid;
const statusIndexCustom = (req, res) => {
    const response = Array.from(store_1.store.index.custom.keys());
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send(response);
};
exports.statusIndexCustom = statusIndexCustom;
const statusDiff = (req, res) => {
    const response = (0, object_1.jsonify)(diffManager_1.diffManager.getDiff());
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send(response);
};
exports.statusDiff = statusDiff;
