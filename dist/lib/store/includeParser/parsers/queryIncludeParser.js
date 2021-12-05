"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryIncludeParser = void 0;
const query_1 = require("@lib/query");
const query_types_1 = require("@lib/query/query.types");
const object_1 = require("@lib/utils/object");
const string_1 = require("@lib/utils/string");
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
                const [queryId, rawQueryArgs] = queryDefinition.split('?');
                const queryArgs = rawQueryArgs
                    ? (0, string_1.parseURLSearchParams)(rawQueryArgs)
                    : {};
                const queryResponse = query_1.queryRunner.run(queryId, queryArgs);
                return (0, query_types_1.isQueryErrorResponse)(queryResponse)
                    ? queryResponse.error
                    : queryResponse.data;
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
