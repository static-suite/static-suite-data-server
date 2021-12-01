"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliasWithoutTypeIncludeParser = void 0;
const aliasWithoutTypeIncludeParser = ({ fileContent, includeData, mountPointPath, includeKey, }, type) => {
    const mountPoint = mountPointPath.reduce((previous, current) => previous?.[current], fileContent);
    const mountPointKey = includeKey.replace('Include', '') === type
        ? type
        : includeKey.replace(`${type.charAt(0).toUpperCase() + type.slice(1)}Include`, '');
    mountPoint[mountPointKey] = includeData;
    delete mountPoint[includeKey];
};
exports.aliasWithoutTypeIncludeParser = aliasWithoutTypeIncludeParser;
