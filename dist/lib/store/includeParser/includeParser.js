"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.includeParser = void 0;
const query_1 = require("@lib/query");
const query_types_1 = require("@lib/query/query.types");
const object_1 = require("@lib/utils/object");
const __1 = require("..");
const aliasWithoutTypeIncludeParser_1 = require("./parsers/types/aliasWithoutTypeIncludeParser");
const parsers_1 = require("./parsers");
const parseParams = (queryString) => {
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
exports.includeParser = {
    static: {
        run: (fileContent) => {
            if (fileContent) {
                const jsonData = fileContent;
                if (jsonData.metadata?.includes) {
                    jsonData.metadata?.includes.forEach((includePath) => {
                        const includePathValue = (0, object_1.getObjectValue)(fileContent, includePath);
                        const includeData = __1.store.data.get(includePathValue);
                        const mountPointPath = includePath.split('.');
                        const includeKey = mountPointPath.pop();
                        if (includeKey) {
                            if (includeKey.toLowerCase().endsWith('configinclude')) {
                                (0, parsers_1.configIncludeParser)({
                                    fileContent,
                                    includeData,
                                    mountPointPath,
                                    includeKey,
                                });
                            }
                            if (includeKey.toLowerCase().endsWith('entityinclude')) {
                                (0, parsers_1.entityIncludeParser)({
                                    fileContent,
                                    includeData,
                                    mountPointPath,
                                    includeKey,
                                });
                            }
                            if (includeKey.toLowerCase().endsWith('custominclude')) {
                                (0, parsers_1.customIncludeParser)({
                                    fileContent,
                                    includeData,
                                    mountPointPath,
                                    includeKey,
                                });
                            }
                            if (includeKey.toLowerCase().endsWith('localeinclude')) {
                                (0, parsers_1.localeIncludeParser)({
                                    fileContent,
                                    includeData,
                                    mountPointPath,
                                    includeKey,
                                });
                            }
                        }
                    });
                }
            }
        },
    },
    dynamic: {
        run: (fileContent) => {
            if (fileContent) {
                const jsonData = fileContent;
                if (jsonData.metadata?.includes) {
                    jsonData.metadata?.includes.forEach((includePath) => {
                        if (includePath.toLowerCase().endsWith('queryinclude')) {
                            const queryData = (0, object_1.getObjectValue)(fileContent, includePath).split('?');
                            const queryId = queryData[0];
                            let queryArgs = {};
                            if (queryData[1]) {
                                queryArgs = parseParams(queryData[1]);
                            }
                            const queryResponse = query_1.queryRunner.run(queryId, queryArgs);
                            let includeData;
                            if ((0, query_types_1.isQueryErrorResponse)(queryResponse)) {
                                includeData = queryResponse.error;
                            }
                            else {
                                includeData = queryResponse.data;
                            }
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
                        }
                    });
                }
            }
        },
    },
};
