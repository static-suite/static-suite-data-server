"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliasIncludeParser = void 0;
const aliasIncludeParser = ({ host, target, mountPath, includeKey, }) => {
    const mountPoint = mountPath.reduce((previous, current) => previous?.[current], host);
    mountPoint[includeKey.replace('Include', '')] = target;
    delete mountPoint[includeKey];
};
exports.aliasIncludeParser = aliasIncludeParser;
