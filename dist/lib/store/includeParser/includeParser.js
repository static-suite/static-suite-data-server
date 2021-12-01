"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.includeParser = void 0;
const query_1 = require("@lib/query");
const object_1 = require("@lib/utils/object");
const __1 = require("..");
const store_constants_1 = require("../store.constants");
const configIncludeParser_1 = require("./parsers/configIncludeParser");
const customIncludeParser_1 = require("./parsers/customIncludeParser");
const entityIncludeParser_1 = require("./parsers/entityIncludeParser");
const localeIncludeParser_1 = require("./parsers/localeIncludeParser");
const aliasWithoutTypeIncludeParser_1 = require("./parsers/types/aliasWithoutTypeIncludeParser");
const parseParams = (querystring) => {
    // parse query string
    const params = new URLSearchParams(querystring);
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
                        const includeData = __1.store.data[store_constants_1.INDEX].get(includePathValue);
                        const mountPointPath = includePath.split('.');
                        const includeKey = mountPointPath.pop();
                        if (includeKey) {
                            if (includeKey.toLowerCase().endsWith('configinclude')) {
                                (0, configIncludeParser_1.configIncludeParser)({
                                    fileContent,
                                    includeData,
                                    mountPointPath,
                                    includeKey,
                                });
                            }
                            if (includeKey.toLowerCase().endsWith('entityinclude')) {
                                (0, entityIncludeParser_1.entityIncludeParser)({
                                    fileContent,
                                    includeData,
                                    mountPointPath,
                                    includeKey,
                                });
                            }
                            if (includeKey.toLowerCase().endsWith('custominclude')) {
                                (0, customIncludeParser_1.customIncludeParser)({
                                    fileContent,
                                    includeData,
                                    mountPointPath,
                                    includeKey,
                                });
                            }
                            if (includeKey.toLowerCase().endsWith('localeinclude')) {
                                (0, localeIncludeParser_1.localeIncludeParser)({
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
    dinamic: {
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
                            const includeData = query_1.queryRunner.run(queryId, queryArgs);
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
