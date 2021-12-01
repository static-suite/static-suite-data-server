"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configIncludeParser = void 0;
const configIncludeParser = ({ fileContent, includeData, mountPointPath, includeKey, }) => {
    const mountPoint = mountPointPath.reduce((previous, current) => previous?.[current], fileContent);
    mountPoint[includeKey.replace('Include', '')] = includeData;
    delete mountPoint[includeKey];
};
exports.configIncludeParser = configIncludeParser;
