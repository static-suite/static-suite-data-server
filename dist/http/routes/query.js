"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runQuery = exports.queryIndex = void 0;
const dataDir_1 = require("@lib/store/dataDir");
const query_1 = require("@lib/query");
const queryIndex = (req, res) => {
    const queryIds = Array.from(query_1.queryManager.getModuleGroupInfo().keys());
    res.render('queryIndex', {
        queryIds: queryIds.length > 0 ? queryIds.map(query => `/query/${query}`) : null,
    });
};
exports.queryIndex = queryIndex;
const runQuery = (req, res) => {
    dataDir_1.dataDirManager.update();
    const args = req.query;
    const queryId = req.params[0];
    const response = query_1.queryRunner.run(queryId, args);
    res.status(200);
    res.set('application/json');
    res.send(response);
};
exports.runQuery = runQuery;
