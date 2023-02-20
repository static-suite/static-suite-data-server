"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryIncludeParser = void 0;
const config_1 = require("../../../config");
const dataServer_types_1 = require("../../../dataServer.types");
const query_1 = require("../../../query");
const query_types_1 = require("../../../query/query.types");
const object_1 = require("../../../utils/object");
const aliasWithoutTypeIncludeParser_1 = require("./types/aliasWithoutTypeIncludeParser");
/**
 * Parses query includes.
 *
 * @remarks
 * Instead of executing a query and adding its result to a JSON file,
 * create a Proxy so queries are only executed when they are consumed,
 * in a Just-In-Time way.
 */
const queryIncludeParser = ({ host, includePath, }) => {
    const queryDefinition = (0, object_1.getObjValue)(host, includePath);
    if (!queryDefinition) {
        return;
    }
    // Execute the query when the "data" property is accessed.
    const proxyHandler = {
        get: (target, prop) => {
            if (prop === 'data') {
                const queryResponse = query_1.queryRunner.run(queryDefinition);
                if ((0, query_types_1.isQueryErrorResponse)(queryResponse)) {
                    return config_1.config.runMode === dataServer_types_1.RunMode.DEV
                        ? `${queryResponse.error} (message visible only in run mode DEV)`
                        : null;
                }
                return queryResponse.data;
            }
            return undefined;
        },
    };
    const target = new Proxy({ data: null }, proxyHandler);
    const mountPath = includePath.split('.');
    const includeKey = mountPath.pop();
    if (includeKey) {
        (0, aliasWithoutTypeIncludeParser_1.aliasWithoutTypeIncludeParser)({ host, target, mountPath, includeKey }, 'query');
    }
};
exports.queryIncludeParser = queryIncludeParser;
