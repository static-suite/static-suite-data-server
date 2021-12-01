"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localeIncludeParser = void 0;
const localeIncludeParser = ({ fileContent, includeData, mountPointPath, includeKey, }) => {
    const mountPoint = mountPointPath.reduce((previous, current) => previous?.[current], fileContent);
    mountPoint[includeKey.replace('Include', '')] = includeData;
    delete mountPoint[includeKey];
};
exports.localeIncludeParser = localeIncludeParser;
