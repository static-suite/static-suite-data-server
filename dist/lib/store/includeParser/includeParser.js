"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.includeParser = void 0;
const query_1 = require("@lib/query");
const query_types_1 = require("@lib/query/query.types");
const object_1 = require("@lib/utils/object");
const __1 = require("..");
const aliasWithoutTypeIncludeParser_1 = require("./parsers/types/aliasWithoutTypeIncludeParser");
const parsers_1 = require("./parsers");
/**
 * Parses a raw query string into an object.
 *
 * @remarks
 * Turns a string like "arg1=a&arg2=b" into an object like
 * \{ arg1: 'a', arg2: 'b'\}
 *
 * @param queryString - A raw query string
 *
 * @returns An object where its keys are the query arguments.
 */
const parseQueryParams = (queryString) => {
    // Parse query string.
    const params = new URLSearchParams(queryString);
    const obj = {};
    Array.from(params.keys()).forEach((key) => {
        if (params.getAll(key).length > 1) {
            obj[key] = params.getAll(key);
        }
        else {
            obj[key] = params.get(key);
        }
    });
    return obj;
};
/**
 * Global parser that is able to parse static and dynamic includes.
 */
exports.includeParser = {
    static: (fileContent) => {
        if (!fileContent) {
            return;
        }
        const jsonData = fileContent;
        if (!jsonData.metadata?.includes) {
            return;
        }
        jsonData.metadata?.includes.forEach((includePath) => {
            const targetKey = (0, object_1.getObjectValue)(fileContent, includePath);
            const includeData = __1.store.data.get(targetKey);
            const mountPointPath = includePath.split('.');
            const includeKey = mountPointPath.pop();
            if (!includeKey) {
                return;
            }
            const normalizedIncludeKey = includeKey.toLowerCase();
            if (normalizedIncludeKey.endsWith('configinclude')) {
                (0, parsers_1.configIncludeParser)({
                    fileContent,
                    includeData,
                    mountPointPath,
                    includeKey,
                });
            }
            if (normalizedIncludeKey.endsWith('entityinclude')) {
                (0, parsers_1.entityIncludeParser)({
                    fileContent,
                    includeData,
                    mountPointPath,
                });
            }
            if (normalizedIncludeKey.endsWith('custominclude')) {
                (0, parsers_1.customIncludeParser)({
                    fileContent,
                    includeData,
                    mountPointPath,
                    includeKey,
                });
            }
            if (normalizedIncludeKey.endsWith('localeinclude')) {
                (0, parsers_1.localeIncludeParser)({
                    fileContent,
                    includeData,
                    mountPointPath,
                    includeKey,
                });
            }
        });
    },
    dynamic: (fileContent) => {
        if (!fileContent) {
            return;
        }
        const jsonData = fileContent;
        if (!jsonData.metadata?.includes) {
            return;
        }
        jsonData.metadata?.includes.forEach((includePath) => {
            if (!includePath.toLowerCase().endsWith('queryinclude')) {
                return;
            }
            const [queryId, rawQueryArgs] = (0, object_1.getObjectValue)(fileContent, includePath).split('?');
            const queryArgs = rawQueryArgs ? parseQueryParams(rawQueryArgs) : {};
            const queryResponse = query_1.queryRunner.run(queryId, queryArgs);
            const includeData = (0, query_types_1.isQueryErrorResponse)(queryResponse)
                ? queryResponse.error
                : queryResponse.data;
            const mountPointPath = includePath.split('.');
            const includeKey = mountPointPath.pop();
            if (includeKey) {
                (0, aliasWithoutTypeIncludeParser_1.aliasWithoutTypeIncludeParser)({
                    fileContent,
                    includeData,
                    mountPointPath,
                    includeKey,
                }, 'query');
            }
        });
    },
};
