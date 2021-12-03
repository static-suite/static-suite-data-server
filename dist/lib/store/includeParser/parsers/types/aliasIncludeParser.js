"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliasIncludeParser = void 0;
const aliasIncludeParser = ({ host: fileContent, target: includeData, mountPath: mountPointPath, includeKey, }) => {
    const mountPoint = mountPointPath.reduce((previous, current) => previous?.[current], fileContent);
    mountPoint[includeKey.replace('Include', '')] = includeData;
    delete mountPoint[includeKey];
};
exports.aliasIncludeParser = aliasIncludeParser;
