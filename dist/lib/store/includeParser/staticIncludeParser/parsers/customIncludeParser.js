"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customIncludeParser = void 0;
const customIncludeParser = ({ fileContent, includeData, mountPointPath, includeKey, }) => {
    const mountPoint = mountPointPath.reduce((previous, current) => previous?.[current], fileContent);
    const mountPointKey = includeKey.replace('Include', '') === 'custom'
        ? 'custom'
        : includeKey.replace('CustomInclude', '');
    mountPoint[mountPointKey] = includeData;
    delete mountPoint[includeKey];
};
exports.customIncludeParser = customIncludeParser;
