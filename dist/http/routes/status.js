"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.status = void 0;
const dataDir_1 = require("@lib/store/dataDir");
const query_1 = require("@lib/query");
const config_1 = require("@lib/config");
const cache_1 = require("@lib/utils/cache");
const status = (req, res) => {
    const response = {
        config: config_1.config,
        dataDirLastUpdate: dataDir_1.dataDirManager.getModificationDate(),
        query: {
            numberOfExecutions: query_1.queryRunner.getCount(),
            numberOfCachedQueries: cache_1.cache.bin('query').size,
        },
    };
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send(response);
};
exports.status = status;
module.exports = { status: exports.status };
