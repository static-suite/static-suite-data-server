"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staticIncludeParser = void 0;
const configIncludeParser_1 = require("./parsers/configIncludeParser");
const customIncludeParser_1 = require("./parsers/customIncludeParser");
const entityIncludeParser_1 = require("./parsers/entityIncludeParser");
const localeIncludeParser_1 = require("./parsers/localeIncludeParser");
const staticIncludeParser = ({ fileContent, store, }) => {
    if (fileContent) {
        const jsonData = fileContent;
        if (jsonData.metadata?.includes) {
            jsonData.metadata?.includes.forEach((includePath) => {
                const includeData = includePath
                    .split('.')
                    .reduce((previous, current) => previous?.[current], fileContent)
                    .split('/')
                    .reduce((prev, curr) => prev && prev[curr], store.data);
                const mountPointPath = includePath.split('.');
                const includeKey = mountPointPath.pop();
                if (includeKey) {
                    if (includePath.toLowerCase().endsWith('configinclude')) {
                        (0, configIncludeParser_1.configIncludeParser)({
                            fileContent,
                            includeData,
                            mountPointPath,
                            includeKey,
                        });
                    }
                    if (includePath.toLowerCase().endsWith('entityinclude')) {
                        (0, entityIncludeParser_1.entityIncludeParser)({
                            fileContent,
                            includeData,
                            mountPointPath,
                            includeKey,
                        });
                    }
                    if (includePath.toLowerCase().endsWith('custominclude')) {
                        (0, customIncludeParser_1.customIncludeParser)({
                            fileContent,
                            includeData,
                            mountPointPath,
                            includeKey,
                        });
                    }
                    if (includePath.toLowerCase().endsWith('localeinclude')) {
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
};
exports.staticIncludeParser = staticIncludeParser;
