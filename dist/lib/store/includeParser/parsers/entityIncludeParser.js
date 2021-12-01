"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entityIncludeParser = void 0;
const entityIncludeParser = ({ fileContent, includeData, mountPointPath, }) => {
    const includeKey = mountPointPath.pop();
    if (includeKey) {
        const mountPoint = mountPointPath.reduce((previous, current) => previous?.[current], fileContent);
        mountPoint[includeKey] = includeData.data?.content;
    }
};
exports.entityIncludeParser = entityIncludeParser;
