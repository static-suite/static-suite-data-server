"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryIncludeParser = void 0;
const query_1 = require("@lib/query");
const query_types_1 = require("@lib/query/query.types");
const object_1 = require("@lib/utils/object");
const string_1 = require("@lib/utils/string");
const aliasWithoutTypeIncludeParser_1 = require("./types/aliasWithoutTypeIncludeParser");
const queryIncludeParser = ({ host, includePath, }) => {
    const [queryId, rawQueryArgs] = (0, object_1.getObjValue)(host, includePath).split('?');
    const queryArgs = rawQueryArgs ? (0, string_1.parseURLSearchParams)(rawQueryArgs) : {};
    const queryResponse = query_1.queryRunner.run(queryId, queryArgs);
    const target = (0, query_types_1.isQueryErrorResponse)(queryResponse)
        ? queryResponse.error
        : queryResponse.data;
    const mountPath = includePath.split('.');
    const includeKey = mountPath.pop();
    if (includeKey) {
        (0, aliasWithoutTypeIncludeParser_1.aliasWithoutTypeIncludeParser)({ host, target, mountPath, includeKey }, 'query');
    }
};
exports.queryIncludeParser = queryIncludeParser;
